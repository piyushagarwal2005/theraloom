const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
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
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    clientPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientPackage',
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    },
    amount: {
      type: Number, // In INR (e.g. 1800)
      required: true,
    },
    amountInPaise: {
      type: Number, // In Paise (e.g. 180000)
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'captured', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    gateway: {
      type: String,
      default: 'razorpay',
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    paymentMethod: {
      type: String,
      default: 'upi',
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceUrl: {
      type: String,
    },
    description: {
      type: String,
      default: 'Psychotherapy Consultation',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
