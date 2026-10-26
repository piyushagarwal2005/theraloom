const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');

// In-memory fallback tier configs in case database hasn't seeded yet
const DEFAULT_TIER_CONFIGS = {
  starter: {
    tierKey: 'starter',
    name: 'Starter Practice',
    monthlyPrice: 0,
    maxActiveClients: 5,
    advancedNoteTemplates: false, // Only freeform notes
    analyticsDepth: 'basic',
    customBranding: false,
    features: ['Up to 5 active clients', 'Standard Booking & Payments', 'Freeform Clinical Notes', 'Basic Analytics'],
  },
  growth: {
    tierKey: 'growth',
    name: 'Growth Practice',
    monthlyPrice: 1499,
    maxActiveClients: 30,
    advancedNoteTemplates: true, // Unlocks SOAP & DAP
    analyticsDepth: 'advanced', // Unlocks no-show rate & forecasting
    customBranding: true,
    features: ['Up to 30 active clients', 'SOAP & DAP Clinical Templates', 'Deep Analytics & No-Show Rate', 'Custom Slug & Branding'],
  },
  unlimited: {
    tierKey: 'unlimited',
    name: 'Unlimited Clinic',
    monthlyPrice: 2999,
    maxActiveClients: 99999,
    advancedNoteTemplates: true,
    analyticsDepth: 'advanced',
    customBranding: true,
    features: ['Unlimited active clients', 'Priority Support', 'Full Clinical Suite', 'Advanced Multi-Year Analytics'],
  },
};

/**
 * Single source of truth for all feature access checks across the platform.
 * Controllers and middleware must NEVER check plan names or tier strings directly.
 * 
 * @param {string|ObjectId} therapistId
 * @param {string} featureKey - 'active_clients_limit' | 'advanced_note_templates' | 'advanced_analytics' | 'custom_branding'
 * @returns {Promise<{ allowed: boolean, reason?: string, currentCount?: number, maxAllowed?: number, tierKey?: string }>}
 */
const canAccess = async (therapistId, featureKey) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) {
    return { allowed: false, reason: 'Therapist not found.' };
  }

  const currentTierKey = therapist.subscription?.tierKey || 'starter';

  // Fetch tier config from MongoDB or fallback
  let tierConfig = await SubscriptionTierConfig.findOne({ tierKey: currentTierKey });
  if (!tierConfig) {
    tierConfig = DEFAULT_TIER_CONFIGS[currentTierKey] || DEFAULT_TIER_CONFIGS.starter;
  }

  switch (featureKey) {
    case 'active_clients_limit': {
      const activeClientsCount = await Client.countDocuments({
        therapistId,
        status: 'active',
      });

      const maxAllowed = tierConfig.maxActiveClients;
      if (activeClientsCount >= maxAllowed) {
        return {
          allowed: false,
          reason: `You have reached the maximum active client capacity (${maxAllowed}) for your ${tierConfig.name} plan. Upgrade to Growth to add more clients.`,
          currentCount: activeClientsCount,
          maxAllowed,
          tierKey: currentTierKey,
        };
      }
      return {
        allowed: true,
        currentCount: activeClientsCount,
        maxAllowed,
        tierKey: currentTierKey,
      };
    }

    case 'advanced_note_templates': {
      if (!tierConfig.advancedNoteTemplates) {
        return {
          allowed: false,
          reason: 'Structured SOAP and DAP clinical documentation templates are available on Growth and Unlimited plans.',
          tierKey: currentTierKey,
        };
      }
      return { allowed: true, tierKey: currentTierKey };
    }

    case 'advanced_analytics': {
      if (tierConfig.analyticsDepth !== 'advanced') {
        return {
          allowed: false,
          reason: 'Advanced analytics (no-show rate analysis, revenue trends, client retention) are exclusive to the Growth tier.',
          tierKey: currentTierKey,
        };
      }
      return { allowed: true, tierKey: currentTierKey };
    }

    case 'custom_branding': {
      if (!tierConfig.customBranding) {
        return {
          allowed: false,
          reason: 'Custom domain and branding requires the Growth or Unlimited tier.',
          tierKey: currentTierKey,
        };
      }
      return { allowed: true, tierKey: currentTierKey };
    }

    default:
      return { allowed: true, tierKey: currentTierKey };
  }
};

module.exports = {
  canAccess,
  DEFAULT_TIER_CONFIGS,
};
