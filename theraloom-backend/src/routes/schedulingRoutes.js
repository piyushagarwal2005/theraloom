const express = require('express');
const {
  getSlotsBySlug,
  getAvailableSlots,
  bookSession,
  bookSessionDirect,
  getMyAvailability,
  updateMyAvailability,
  getTherapistSessions,
  updateSessionStatus,
  joinWaitlist,
} = require('../controllers/schedulingController');
const { protectTherapist } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for clients
router.get('/slots/:slug', getSlotsBySlug);
router.get('/available-slots', getAvailableSlots);
router.post('/book/:slug', bookSession);
router.post('/book-session', bookSessionDirect);
router.post('/waitlist/:slug', joinWaitlist);
router.post('/waitlist', joinWaitlist);

// Therapist protected routes
router.get('/availability', protectTherapist, getMyAvailability);
router.put('/availability', protectTherapist, updateMyAvailability);
router.get('/sessions', protectTherapist, getTherapistSessions);
router.put('/sessions/:id/status', protectTherapist, updateSessionStatus);

module.exports = router;
