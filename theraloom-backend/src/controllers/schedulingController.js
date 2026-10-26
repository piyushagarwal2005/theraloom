const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const schedulingService = require('../services/schedulingService');

// @desc    Get available slots for a therapist on a date (by query params: therapistId or slug)
// @route   GET /api/v1/scheduling/available-slots
// @access  Public
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { therapistId, slug, date, timezone = 'Asia/Kolkata' } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a target date in YYYY-MM-DD format.',
      });
    }

    let therapist = null;
    if (therapistId) {
      therapist = await Therapist.findById(therapistId);
    } else if (slug) {
      therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true });
    }

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    const slots = await schedulingService.getAvailableSlots(therapist._id, date, timezone);

    res.status(200).json({
      success: true,
      therapist: {
        id: therapist._id,
        _id: therapist._id,
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

// @desc    Get available slots for a therapist on a date (by slug in URL param)
// @route   GET /api/v1/scheduling/slots/:slug
// @access  Public
exports.getSlotsBySlug = async (req, res, next) => {
  req.query.slug = req.params.slug;
  return exports.getAvailableSlots(req, res, next);
};

// @desc    Book a session atomically (supports both /book/:slug and /book-session with therapistId in body)
// @route   POST /api/v1/scheduling/book/:slug OR POST /api/v1/scheduling/book-session
// @access  Public
exports.bookSession = async (req, res, next) => {
  try {
    const slug = req.params.slug || req.body.slug;
    const therapistId = req.body.therapistId;
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceName,
      durationMinutes,
      date,
      startTime,
      price,
      presentingConcern,
      consentAgreed,
      consentTimestamp,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    if (!clientName || !clientEmail || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, date, and startTime are required to book a session.',
      });
    }

    let therapist = null;
    if (therapistId) {
      therapist = await Therapist.findById(therapistId);
    } else if (slug) {
      therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true });
    }

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    const sessionPrice = price || therapist.consultationFee || 1800;

    // 1. Atomic booking through scheduling service
    const session = await schedulingService.bookSession(therapist._id, {
      clientName,
      clientEmail,
      clientPhone,
      serviceName: serviceName || 'Individual Psychotherapy',
      durationMinutes: durationMinutes || 50,
      date,
      startTime,
      price: sessionPrice,
      paymentStatus: 'paid',
    });

    // 2. Enhance client record with consent & presenting concerns
    const client = await Client.findById(session.clientId);
    if (client) {
      if (consentAgreed) {
        client.consentRecords.push({
          version: '1.0',
          termsSummary: 'Theraloom Tele-Mental Health & Confidentiality Consent (Under Indian Mental Healthcare Act 2017)',
          agreed: true,
          consentedAt: consentTimestamp ? new Date(consentTimestamp) : new Date(),
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
        });
      }

      if (presentingConcern) {
        if (!client.intakeForm) client.intakeForm = {};
        if (!client.intakeForm.presentingConcerns) client.intakeForm.presentingConcerns = [];
        if (!client.intakeForm.presentingConcerns.includes(presentingConcern)) {
          client.intakeForm.presentingConcerns.push(presentingConcern);
        }
      }

      await client.save();

      // 3. Persist Payment record for client portal & invoices
      const invoiceNumber = `TL-INV-${Date.now().toString().slice(-6)}`;
      const paymentMethod = req.body.paymentMethod || 'upi';
      const createdPayment = await Payment.create({
        therapistId: therapist._id,
        clientId: client._id,
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        sessionId: session._id,
        amount: sessionPrice,
        amountInPaise: Math.round(sessionPrice * 100),
        currency: 'INR',
        status: 'captured',
        paymentMethod,
        invoiceNumber,
        taxAmount: Math.round(sessionPrice * 0.18),
        platformFee: Math.round(sessionPrice * 0.02),
        netAmount: Math.round(sessionPrice * 0.98),
        razorpayOrderId: razorpayOrderId || `order_${Date.now()}`,
        razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
      });

      return res.status(201).json({
        success: true,
        message: 'Your session has been successfully booked!',
        session,
        payment: createdPayment,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Your session has been successfully booked!',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Alias for direct booking route
exports.bookSessionDirect = exports.bookSession;

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
// @route   POST /api/v1/scheduling/waitlist/:slug OR POST /api/v1/scheduling/waitlist
// @access  Public
exports.joinWaitlist = async (req, res, next) => {
  try {
    const slug = req.params.slug || req.body.slug;
    const therapistId = req.body.therapistId;
    const { clientName, clientEmail, clientPhone, preferredDate, preferredTimeRange, message } = req.body;

    let therapist;
    if (therapistId) {
      therapist = await Therapist.findById(therapistId);
    } else if (slug) {
      therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true });
    }

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
