const jwt = require('jsonwebtoken');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const initChatSocket = (io) => {
  io.use((socket, next) => {
    // Optional socket JWT auth for therapist or client token
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'theraloom_super_secure_jwt_secret_key_2026_india'
        );
        socket.userId = decoded.id;
      } catch (err) {
        // Allow client without token to identify via handshake metadata
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for a specific conversation
    socket.on('join_conversation', async ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(`conv_${conversationId}`);
      console.log(`[Socket.io] ${socket.id} joined room conv_${conversationId}`);
    });

    // Leave room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(`conv_${conversationId}`);
    });

    // Real-time message sending & persistence
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderType, senderId, senderName, text } = data;
        if (!conversationId || !text || !senderType) return;

        // Persist message to database
        const message = await Message.create({
          conversationId,
          senderType,
          senderId: senderId || 'anonymous',
          senderName: senderName || (senderType === 'therapist' ? 'Therapist' : 'Client'),
          text,
          isRead: false,
        });

        // Update conversation lastMessage & unread count
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

        // Broadcast to all participants in this room
        io.to(`conv_${conversationId}`).emit('new_message', message);
      } catch (error) {
        console.error('[Socket.io send_message Error]', error);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, senderName }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', { senderName });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user_stop_typing');
    });

    // Read receipts
    socket.on('mark_read', async ({ conversationId, userType }) => {
      try {
        if (!conversationId) return;
        const now = new Date();
        await Message.updateMany(
          {
            conversationId,
            senderType: userType === 'therapist' ? 'client' : 'therapist',
            isRead: false,
          },
          { isRead: true, readAt: now }
        );

        const resetCount = userType === 'therapist'
          ? { unreadCountTherapist: 0 }
          : { unreadCountClient: 0 };

        await Conversation.findByIdAndUpdate(conversationId, resetCount);

        io.to(`conv_${conversationId}`).emit('messages_read', { readAt: now, userType });
      } catch (err) {
        console.error('[Socket.io mark_read Error]', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initChatSocket;
