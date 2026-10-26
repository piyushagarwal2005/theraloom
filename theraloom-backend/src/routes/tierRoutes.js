const express = require('express');
const { getTiers, upgradeTier, checkFeatureAccess } = require('../controllers/tierController');
const { protectTherapist } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getTiers);
router.post('/upgrade', protectTherapist, upgradeTier);
router.get('/check/:featureKey', protectTherapist, checkFeatureAccess);

module.exports = router;
