const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');

// @desc    Get all conversations for therapist
// @route   GET /api/v1/chat/conversations
// @access  Private (Therapist)
exports.getTherapistConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ therapistId: req.therapist._id })
      .populate('clientId', 'name email phone avatarUrl status tags')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create conversation for client portal
// @route   POST /api/v1/chat/client-conversation
// @access  Public
exports.getClientConversation = async (req, res, next) => {
  try {
    const { therapistSlug, therapistId, clientId, clientEmail, clientName } = req.body;

    let therapist = null;
    if (therapistId) {
      therapist = await Therapist.findById(therapistId);
    } else if (therapistSlug) {
      therapist = await Therapist.findOne({ slug: therapistSlug.toLowerCase() });
    } else if (clientId) {
      const foundClient = await Client.findById(clientId);
      if (foundClient) {
        therapist = await Therapist.findById(foundClient.therapistId);
      }
    }

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    let client = null;
    if (clientId) {
      client = await Client.findById(clientId);
    } else if (clientEmail) {
      client = await Client.findOne({
        therapistId: therapist._id,
        email: clientEmail.toLowerCase(),
      });
    }

    if (!client) {
      client = await Client.create({
        therapistId: therapist._id,
        name: clientName || 'Client',
        email: clientEmail ? clientEmail.toLowerCase() : `client_${Date.now()}@theraloom.in`,
        status: 'active',
      });
    }

    let conversation = await Conversation.findOne({
      therapistId: therapist._id,
      clientId: client._id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        therapistId: therapist._id,
        clientId: client._id,
        lastMessage: 'Conversation started.',
      });
    }

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      conversation,
      client,
      therapist: {
        id: therapist._id,
        _id: therapist._id,
        name: therapist.name,
        title: therapist.title,
        profileImage: therapist.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/v1/chat/messages/:conversationId
// @access  Public (protected by conversation membership)
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message via HTTP fallback
// @route   POST /api/v1/chat/messages
// @access  Public
exports.sendMessageHttp = async (req, res, next) => {
  try {
    const { conversationId, senderType, senderId, senderName, text } = req.body;

    if (!conversationId || !text || !senderType) {
      return res.status(400).json({ success: false, message: 'Missing message details.' });
    }

    const message = await Message.create({
      conversationId,
      senderType,
      senderId: senderId || 'user',
      senderName: senderName || 'Sender',
      text,
    });

    const updateFields = {
      lastMessage: text,
      lastMessageAt: new Date(),
    };
    if (senderType === 'therapist') {
      updateFields.$inc = { unreadCountClient: 1 };
    } else {
      updateFields.$inc = { unreadCountTherapist: 1 };
    }

    await Conversation.findByIdAndUpdate(conversationId, updateFields);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications for therapist or client
// @route   GET /api/v1/chat/notifications
// @access  Private (Therapist)
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'therapist',
      recipientId: req.therapist._id,
    }).sort({ createdAt: -1 }).limit(30);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/chat/notifications/:id/read
// @access  Private (Therapist)
exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};
