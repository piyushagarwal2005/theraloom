const mongoose = require('mongoose');

const subscriptionTierConfigSchema = new mongoose.Schema(
  {
    tierKey: {
      type: String,
      required: true,
      unique: true,
      enum: ['starter', 'growth', 'unlimited'],
    },
    name: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    monthlyPrice: {
      type: Number, // in INR (e.g. 0, 1499, 2999)
      required: true,
      default: 0,
    },
    maxActiveClients: {
      type: Number, // e.g. 10 for starter, 40 for growth, 99999 for unlimited
      required: true,
    },
    advancedNoteTemplates: {
      type: Boolean, // SOAP / DAP templates
      default: false,
    },
    analyticsDepth: {
      type: String,
      enum: ['basic', 'advanced'],
      default: 'basic',
    },
    customBranding: {
      type: Boolean,
      default: false,
    },
    features: [
      {
        type: String,
      },
    ],
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionTierConfig', subscriptionTierConfigSchema);
