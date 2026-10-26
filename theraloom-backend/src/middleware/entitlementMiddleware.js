const entitlementService = require('../services/entitlementService');

/**
 * Express middleware to enforce feature gating via the central Entitlement Service.
 * @param {string} featureKey
 */
const requireEntitlement = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (!req.therapist || !req.therapist._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for entitlement verification.',
        });
      }

      const access = await entitlementService.canAccess(req.therapist._id, featureKey);

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          code: 'TIER_LIMIT_REACHED',
          message: access.reason,
          featureKey,
          currentTier: access.tierKey,
          currentCount: access.currentCount,
          maxAllowed: access.maxAllowed,
        });
      }

      req.entitlement = access;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requireEntitlement };
