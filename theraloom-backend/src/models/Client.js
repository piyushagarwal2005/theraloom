const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema({
  version: {
    type: String,
    default: '1.0',
  },
  termsSummary: {
    type: String,
    default: 'Informed Consent for Tele-Psychotherapy, Privacy, and Confidentiality under the Mental Healthcare Act 2017 (India).',
  },
  agreed: {
    type: Boolean,
    required: true,
    default: false,
  },
  consentedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: '',
  },
}, { _id: true });

const intakeFormSchema = new mongoose.Schema({
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  demographics: {
    occupation: { type: String, default: '' },
    maritalStatus: { type: String, default: '' },
    city: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
  },
  presentingConcerns: [{ type: String }],
  therapyGoals: {
    type: String,
    default: '',
  },
  priorTherapyExperience: {
    type: String,
    default: 'No',
  },
  medicalHistory: {
    type: String,
    default: '',
  },
  emergencyContact: {
    name: { type: String, default: '' },
    relation: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
}, { _id: false });

const clientSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lead'],
      default: 'active',
      index: true,
    },
    tags: {
      type: [String],
      default: ['regular'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    intakeForm: {
      type: intakeFormSchema,
      default: () => ({}),
    },
    consentRecords: {
      type: [consentRecordSchema],
      default: [],
    },
    lastSessionDate: {
      type: Date,
    },
    notesSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique client email per therapist (a client can consult different therapists independently)
clientSchema.index({ therapistId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Client', clientSchema);
