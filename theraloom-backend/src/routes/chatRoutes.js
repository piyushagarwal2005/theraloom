const express = require('express');
const {
  getTherapistConversations,
  getClientConversation,
  getMessages,
  sendMessageHttp,
  getNotifications,
  markNotificationRead,
} = require('../controllers/chatController');
const { protectTherapist } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for client chat
router.post('/client-conversation', getClientConversation);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessageHttp);

// Therapist routes
router.get('/conversations', protectTherapist, getTherapistConversations);
router.get('/notifications', protectTherapist, getNotifications);
router.put('/notifications/:id/read', protectTherapist, markNotificationRead);

module.exports = router;
