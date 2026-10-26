const express = require('express');
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protectTherapist } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protectTherapist, getDashboardAnalytics);

module.exports = router;
