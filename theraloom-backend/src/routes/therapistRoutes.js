const express = require('express');
const {
  getPublicProfile,
  getPublicTherapists,
  updateProfile,
  uploadAvatar,
} = require('../controllers/therapistController');
const { protectTherapist } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/public', getPublicTherapists);
router.get('/directory', getPublicTherapists);
router.get('/public/:slug', getPublicProfile);

// Protected routes (Therapist)
router.put('/profile', protectTherapist, updateProfile);
router.post('/avatar', protectTherapist, upload.single('avatar'), uploadAvatar);

module.exports = router;
