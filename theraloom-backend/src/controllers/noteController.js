const SessionNote = require('../models/SessionNote');
const Client = require('../models/Client');
const entitlementService = require('../services/entitlementService');
const notificationService = require('../services/notificationService');

/**
 * Explicit serializer for client-facing notes.
 * Strictly guarantees private notes and therapist-internal fields are NEVER exposed!
 */
const serializeClientNote = (note) => ({
  id: note._id,
  title: note.title,
  content: note.content,
  format: note.format,
  soapData: note.soapData,
  dapData: note.dapData,
  sharedAt: note.sharedAt || note.updatedAt,
  createdAt: note.createdAt,
});

// @desc    Get all notes for the logged-in therapist across clients
// @route   GET /api/v1/notes
// @access  Private (Therapist)
exports.getAllNotes = async (req, res, next) => {
  try {
    const { clientId, noteType } = req.query;
    const filter = { therapistId: req.therapist._id };
    if (clientId) filter.clientId = clientId;
    if (noteType) filter.noteType = noteType;

    const notes = await SessionNote.find(filter)
      .populate('clientId', 'name email')
      .populate('sessionId', 'serviceName startTime')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes for a specific client (Therapist view: private + shared)
// @route   GET /api/v1/notes/client/:clientId
// @access  Private (Therapist)
exports.getTherapistNotes = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findOne({
      _id: clientId,
      therapistId: req.therapist._id,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const notes = await SessionNote.find({
      therapistId: req.therapist._id,
      clientId,
    }).sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get SHARED notes for a client (Client Portal view - strictly filtered)
// @route   GET /api/v1/notes/shared/:clientId
// @access  Public (or Client-authenticated via email/portal query)
exports.getClientSharedNotes = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { email } = req.query;

    const query = { _id: clientId };
    if (email) {
      query.email = email.toLowerCase();
    }

    const client = await Client.findOne(query);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client records not found.' });
    }

    // Critical security: Query explicitly enforces noteType: 'shared'
    const notes = await SessionNote.find({
      clientId: client._id,
      noteType: 'shared',
    }).sort({ createdAt: -1 });

    // Explicit serialization to strip any sensitive backend metadata
    const safeNotes = notes.map(serializeClientNote);

    res.status(200).json({
      success: true,
      count: safeNotes.length,
      notes: safeNotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new clinical note (Default: private)
// @route   POST /api/v1/notes
// @access  Private (Therapist)
exports.createNote = async (req, res, next) => {
  try {
    const {
      clientId,
      sessionId,
      title,
      noteType = 'private', // Defaults to private
      format = 'freeform',
      content,
      soapData,
      dapData,
      isPinned,
    } = req.body;

    // Feature gate check: SOAP / DAP templates require Growth or Unlimited tier
    if (format === 'SOAP' || format === 'DAP') {
      const entitlement = await entitlementService.canAccess(
        req.therapist._id,
        'advanced_note_templates'
      );
      if (!entitlement.allowed) {
        return res.status(403).json({
          success: false,
          code: 'TIER_LIMIT_REACHED',
          message: entitlement.reason,
          requiredTier: 'growth',
        });
      }
    }

    const client = await Client.findOne({
      _id: clientId,
      therapistId: req.therapist._id,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const note = await SessionNote.create({
      therapistId: req.therapist._id,
      clientId,
      sessionId: sessionId || null,
      title: title || 'Clinical Session Note',
      noteType: noteType === 'shared' ? 'shared' : 'private',
      format,
      content: content || '',
      soapData: soapData || {},
      dapData: dapData || {},
      isPinned: Boolean(isPinned),
      sharedAt: noteType === 'shared' ? new Date() : null,
    });

    if (note.noteType === 'shared') {
      try {
        await notificationService.notifySharedNote(client, note);
      } catch (e) {
        console.warn('[Notification] Shared note notice failed:', e.message);
      }
    }

    res.status(201).json({
      success: true,
      message: `Note saved successfully as ${note.noteType}.`,
      note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing clinical note
// @route   PUT /api/v1/notes/:id
// @access  Private (Therapist)
exports.updateNote = async (req, res, next) => {
  try {
    const note = await SessionNote.findOne({
      _id: req.params.id,
      therapistId: req.therapist._id,
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const { title, noteType, format, content, soapData, dapData, isPinned } = req.body;

    if (format && (format === 'SOAP' || format === 'DAP') && format !== note.format) {
      const entitlement = await entitlementService.canAccess(
        req.therapist._id,
        'advanced_note_templates'
      );
      if (!entitlement.allowed) {
        return res.status(403).json({
          success: false,
          code: 'TIER_LIMIT_REACHED',
          message: entitlement.reason,
        });
      }
    }

    if (title) note.title = title;
    if (format) note.format = format;
    if (content !== undefined) note.content = content;
    if (soapData) note.soapData = soapData;
    if (dapData) note.dapData = dapData;
    if (isPinned !== undefined) note.isPinned = isPinned;

    if (noteType) {
      if (noteType === 'shared' && note.noteType !== 'shared') {
        note.sharedAt = new Date();
      }
      note.noteType = noteType;
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a clinical note
// @route   DELETE /api/v1/notes/:id
// @access  Private (Therapist)
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await SessionNote.findOneAndDelete({
      _id: req.params.id,
      therapistId: req.therapist._id,
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Clinical note deleted.',
    });
  } catch (error) {
    next(error);
  }
};
