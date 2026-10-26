const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      default: '',
    },
    preferredDate: {
      type: String, // "YYYY-MM-DD"
    },
    preferredTimeRange: {
      type: String, // e.g. "Morning", "Evening"
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['waiting', 'contacted', 'booked', 'archived'],
      default: 'waiting',
    },
    notifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
