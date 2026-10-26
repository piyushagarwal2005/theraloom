const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');
const Therapist = require('../models/Therapist');
const entitlementService = require('../services/entitlementService');

// @desc    Get all available subscription tier configurations
// @route   GET /api/v1/tiers
// @access  Public
exports.getTiers = async (req, res, next) => {
  try {
    let tiers = await SubscriptionTierConfig.find().sort({ monthlyPrice: 1 });
    if (tiers.length === 0) {
      // Initialize defaults
      const defaults = Object.values(entitlementService.DEFAULT_TIER_CONFIGS);
      tiers = await SubscriptionTierConfig.insertMany(defaults);
    }

    res.status(200).json({
      success: true,
      tiers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade or change therapist subscription tier
// @route   POST /api/v1/tiers/upgrade
// @access  Private (Therapist)
exports.upgradeTier = async (req, res, next) => {
  try {
    const { tierKey } = req.body;
    if (!['starter', 'growth', 'unlimited'].includes(tierKey)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription tier selected.' });
    }

    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    therapist.subscription.tierKey = tierKey;
    therapist.subscription.status = 'active';
    therapist.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await therapist.save();

    res.status(200).json({
      success: true,
      message: `Successfully updated subscription to ${tierKey.toUpperCase()} tier!`,
      subscription: therapist.subscription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check single entitlement for current therapist
// @route   GET /api/v1/tiers/check/:featureKey
// @access  Private (Therapist)
exports.checkFeatureAccess = async (req, res, next) => {
  try {
    const { featureKey } = req.params;
    const access = await entitlementService.canAccess(req.therapist._id, featureKey);
    res.status(200).json({
      success: true,
      access,
    });
  } catch (error) {
    next(error);
  }
};
