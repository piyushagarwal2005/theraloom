const express = require('express');
const {
  getSlotsBySlug,
  bookSession,
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
router.post('/book/:slug', bookSession);
router.post('/waitlist/:slug', joinWaitlist);

// Therapist protected routes
router.get('/availability', protectTherapist, getMyAvailability);
router.put('/availability', protectTherapist, updateMyAvailability);
router.get('/sessions', protectTherapist, getTherapistSessions);
router.put('/sessions/:id/status', protectTherapist, updateSessionStatus);

module.exports = router;
