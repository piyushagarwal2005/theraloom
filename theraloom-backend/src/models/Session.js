const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      default: '',
    },
    serviceName: {
      type: String,
      default: 'Individual Psychotherapy',
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 50,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
      index: true,
    },
    price: {
      type: Number,
      required: true,
      default: 1800,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'package_redeemed', 'refunded'],
      default: 'paid',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['client', 'therapist', 'system', ''],
      default: '',
    },
    clientPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientPackage',
    },
  },
  { timestamps: true }
);

// Compound index to help query bookings quickly
sessionSchema.index({ therapistId: 1, startTime: 1 });
sessionSchema.index({ therapistId: 1, date: 1 });

module.exports = mongoose.model('Session', sessionSchema);
