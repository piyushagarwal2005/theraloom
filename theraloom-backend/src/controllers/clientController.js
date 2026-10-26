const Client = require('../models/Client');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const SessionNote = require('../models/SessionNote');
const entitlementService = require('../services/entitlementService');

// @desc    Get all clients for therapist (searchable, filterable, sortable)
// @route   GET /api/v1/clients
// @access  Private (Therapist)
exports.getClients = async (req, res, next) => {
  try {
    const { search, status, tag, sortBy = 'createdAt', order = 'desc' } = req.query;
    const filter = { therapistId: req.therapist._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (tag && tag !== 'all') {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const clients = await Client.find(filter).sort({ [sortBy]: sortOrder });

    res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client full profile with sessions, payments, and notes summary
// @route   GET /api/v1/clients/:id
// @access  Private (Therapist)
exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      therapistId: req.therapist._id,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    // Aggregate sessions for this client
    const sessions = await Session.find({
      therapistId: req.therapist._id,
      clientId: client._id,
    }).sort({ startTime: -1 });

    // Aggregate payments
    const payments = await Payment.find({
      therapistId: req.therapist._id,
      clientId: client._id,
    }).sort({ createdAt: -1 });

    // Aggregate clinical notes (Therapist sees both private & shared)
    const notes = await SessionNote.find({
      therapistId: req.therapist._id,
      clientId: client._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      client,
      sessions,
      payments,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually create a new client
// @route   POST /api/v1/clients
// @access  Private (Therapist)
exports.createClient = async (req, res, next) => {
  try {
    const { name, email, phone, status, tags, notesSummary } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    // Entitlement check: active client limit
    const canAdd = await entitlementService.canAccess(req.therapist._id, 'active_clients_limit');
    if (!canAdd.allowed) {
      return res.status(403).json({
        success: false,
        code: 'TIER_LIMIT_REACHED',
        message: canAdd.reason,
        currentCount: canAdd.currentCount,
        maxAllowed: canAdd.maxAllowed,
      });
    }

    const existingClient = await Client.findOne({
      therapistId: req.therapist._id,
      email: email.toLowerCase(),
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'A client with this email already exists in your practice.',
      });
    }

    const client = await Client.create({
      therapistId: req.therapist._id,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      status: status || 'active',
      tags: tags || ['regular'],
      notesSummary: notesSummary || '',
    });

    res.status(201).json({
      success: true,
      message: 'Client added successfully.',
      client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client tags, status, notes
// @route   PUT /api/v1/clients/:id
// @access  Private (Therapist)
exports.updateClient = async (req, res, next) => {
  try {
    const { name, phone, status, tags, notesSummary } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      therapistId: req.therapist._id,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    if (name) client.name = name;
    if (phone !== undefined) client.phone = phone;
    if (status) client.status = status;
    if (tags) client.tags = tags;
    if (notesSummary !== undefined) client.notesSummary = notesSummary;

    await client.save();

    res.status(200).json({
      success: true,
      message: 'Client details updated.',
      client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Intake Form (by client or therapist)
// @route   POST /api/v1/clients/intake
// @access  Public
exports.submitIntake = async (req, res, next) => {
  try {
    const { therapistSlug, email, name, phone, intakeData } = req.body;

    const Therapist = require('../models/Therapist');
    const therapist = await Therapist.findOne({ slug: therapistSlug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    let client = await Client.findOne({
      therapistId: therapist._id,
      email: email.toLowerCase(),
    });

    if (!client) {
      client = new Client({
        therapistId: therapist._id,
        name: name || 'Client',
        email: email.toLowerCase(),
        phone: phone || '',
        status: 'active',
      });
    }

    client.intakeForm = {
      isCompleted: true,
      completedAt: new Date(),
      demographics: intakeData?.demographics || {},
      presentingConcerns: intakeData?.presentingConcerns || [],
      therapyGoals: intakeData?.therapyGoals || '',
      priorTherapyExperience: intakeData?.priorTherapyExperience || 'No',
      medicalHistory: intakeData?.medicalHistory || '',
      emergencyContact: intakeData?.emergencyContact || {},
    };

    await client.save();

    res.status(200).json({
      success: true,
      message: 'Intake form submitted and saved securely.',
      client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Capture Digital Consent with timestamp and audit data
// @route   POST /api/v1/clients/consent
// @access  Public
exports.submitConsent = async (req, res, next) => {
  try {
    const { therapistSlug, email, agreed, version = '1.0' } = req.body;

    if (!agreed) {
      return res.status(400).json({
        success: false,
        message: 'Explicit consent must be granted to proceed with clinical services.',
      });
    }

    const Therapist = require('../models/Therapist');
    const therapist = await Therapist.findOne({ slug: therapistSlug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    let client = await Client.findOne({
      therapistId: therapist._id,
      email: email.toLowerCase(),
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client record not found. Please initiate booking or intake first.',
      });
    }

    const consentRecord = {
      version,
      termsSummary: 'Theraloom Tele-Mental Health & Confidentiality Consent (Under Indian Mental Healthcare Act 2017)',
      agreed: true,
      consentedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
    };

    client.consentRecords.push(consentRecord);
    await client.save();

    res.status(200).json({
      success: true,
      message: 'Informed consent captured and audited successfully.',
      consent: consentRecord,
    });
  } catch (error) {
    next(error);
  }
};
