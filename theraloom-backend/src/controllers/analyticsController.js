const analyticsService = require('../services/analyticsService');
const entitlementService = require('../services/entitlementService');

// @desc    Get practice analytics and business metrics
// @route   GET /api/v1/analytics/dashboard
// @access  Private (Therapist)
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const stats = await analyticsService.getPracticeOverview(req.therapist._id);
    const entitlement = await entitlementService.canAccess(req.therapist._id, 'advanced_analytics');

    res.status(200).json({
      success: true,
      hasAdvancedAnalytics: entitlement.allowed,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
