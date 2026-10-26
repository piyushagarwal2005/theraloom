const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sessionCount: {
      type: Number,
      required: true,
      enum: [3, 6, 12],
      default: 3,
    },
    price: {
      type: Number,
      required: true, // in INR
    },
    discountPercentage: {
      type: Number,
      default: 10,
    },
    validityDays: {
      type: Number,
      default: 90,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
