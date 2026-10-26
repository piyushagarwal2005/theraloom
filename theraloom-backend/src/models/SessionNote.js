const mongoose = require('mongoose');

const soapSchema = new mongoose.Schema({
  subjective: { type: String, default: '' },
  objective: { type: String, default: '' },
  assessment: { type: String, default: '' },
  plan: { type: String, default: '' },
}, { _id: false });

const dapSchema = new mongoose.Schema({
  data: { type: String, default: '' },
  assessment: { type: String, default: '' },
  plan: { type: String, default: '' },
}, { _id: false });

const sessionNoteSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Session Clinical Note',
    },
    noteType: {
      type: String,
      enum: ['private', 'shared'],
      default: 'private', // Security Rule: Default strictly to private
      index: true,
    },
    format: {
      type: String,
      enum: ['freeform', 'SOAP', 'DAP'],
      default: 'freeform',
    },
    content: {
      type: String, // Rich-text HTML content
      default: '',
    },
    soapData: {
      type: soapSchema,
      default: () => ({}),
    },
    dapData: {
      type: dapSchema,
      default: () => ({}),
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    sharedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
