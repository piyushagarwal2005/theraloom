const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Lead = require('../models/Lead');
const schedulingService = require('../services/schedulingService');

// @desc    Get available slots for a therapist on a date
// @route   GET /api/v1/scheduling/slots/:slug
// @access  Public
exports.getSlotsBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { date, timezone = 'Asia/Kolkata' } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a target date in YYYY-MM-DD format.',
      });
    }

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    const slots = await schedulingService.getAvailableSlots(therapist._id, date, timezone);

    res.status(200).json({
      success: true,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        slug: therapist.slug,
        title: therapist.title,
        consultationFee: therapist.consultationFee,
        services: therapist.services,
      },
      date,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a session atomically
// @route   POST /api/v1/scheduling/book/:slug
// @access  Public
exports.bookSession = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceName,
      durationMinutes,
      date,
      startTime,
      price,
    } = req.body;

    if (!clientName || !clientEmail || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, date, and startTime are required to book a session.',
      });
    }

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    const session = await schedulingService.bookSession(therapist._id, {
      clientName,
      clientEmail,
      clientPhone,
      serviceName: serviceName || 'Individual Psychotherapy',
      durationMinutes: durationMinutes || 50,
      date,
      startTime,
      price: price || therapist.consultationFee || 1800,
      paymentStatus: 'paid', // In test mode or post-Razorpay verification
    });

    res.status(201).json({
      success: true,
      message: 'Your session has been successfully booked!',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get therapist's own availability configuration
// @route   GET /api/v1/scheduling/availability
// @access  Private (Therapist)
exports.getMyAvailability = async (req, res, next) => {
  try {
    let availability = await Availability.findOne({ therapistId: req.therapist._id });
    if (!availability) {
      availability = await Availability.create({
        therapistId: req.therapist._id,
      });
    }

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update therapist availability configuration
// @route   PUT /api/v1/scheduling/availability
// @access  Private (Therapist)
exports.updateMyAvailability = async (req, res, next) => {
  try {
    const { weeklySchedule, overrides, blockedDates, slotDuration, bufferTimeMinutes, timezone } = req.body;

    let availability = await Availability.findOne({ therapistId: req.therapist._id });
    if (!availability) {
      availability = new Availability({ therapistId: req.therapist._id });
    }

    if (weeklySchedule) availability.weeklySchedule = weeklySchedule;
    if (overrides) availability.overrides = overrides;
    if (blockedDates) availability.blockedDates = blockedDates;
    if (slotDuration) availability.slotDuration = slotDuration;
    if (bufferTimeMinutes !== undefined) availability.bufferTimeMinutes = bufferTimeMinutes;
    if (timezone) availability.timezone = timezone;

    await availability.save();

    res.status(200).json({
      success: true,
      message: 'Availability settings saved successfully.',
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get therapist's sessions (calendar / list)
// @route   GET /api/v1/scheduling/sessions
// @access  Private (Therapist)
exports.getTherapistSessions = async (req, res, next) => {
  try {
    const { status, startDate, endDate, date } = req.query;
    const filter = { therapistId: req.therapist._id };

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (startDate && endDate) {
      filter.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const sessions = await Session.find(filter)
      .populate('clientId', 'name email phone avatarUrl status tags')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session status (completed, cancelled, no_show)
// @route   PUT /api/v1/scheduling/sessions/:id/status
// @access  Private (Therapist)
exports.updateSessionStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const session = await Session.findOne({
      _id: req.params.id,
      therapistId: req.therapist._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = status;
    if (cancellationReason) {
      session.cancellationReason = cancellationReason;
      session.cancelledBy = 'therapist';
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: `Session marked as ${status}.`,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join waitlist when a slot or day is full
// @route   POST /api/v1/scheduling/waitlist/:slug
// @access  Public
exports.joinWaitlist = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { clientName, clientEmail, clientPhone, preferredDate, preferredTimeRange, message } = req.body;

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    const lead = await Lead.create({
      therapistId: therapist._id,
      clientName,
      clientEmail: clientEmail.toLowerCase(),
      clientPhone,
      preferredDate,
      preferredTimeRange,
      message,
      status: 'waiting',
    });

    res.status(201).json({
      success: true,
      message: 'You have been added to the priority waitlist. We will notify you as soon as a slot opens!',
      lead,
    });
  } catch (error) {
    next(error);
  }
};
