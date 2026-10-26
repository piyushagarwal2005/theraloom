const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  durationMinutes: {
    type: Number,
    required: true,
    enum: [30, 45, 50, 60, 75, 90],
    default: 50,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Do not return by default
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String, // e.g. "Licensed Clinical Psychologist (RCI Registered)"
      default: 'Licensed Psychologist',
      trim: true,
    },
    qualifications: {
      type: String, // e.g. "M.Phil Clinical Psychology, NIMHANS"
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    specializations: {
      type: [String],
      default: ['Anxiety', 'Depression', 'Stress Management'],
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String, // e.g. "Bandra West, Mumbai (Available Online across India)"
      default: 'Available Online (All India)',
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    consultationFee: {
      type: Number,
      default: 1800,
    },
    profileImage: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    services: {
      type: [serviceSchema],
      default: [
        {
          title: 'Individual Psychotherapy',
          description: 'One-on-one evidence-based therapy session tailored for personal growth, anxiety, or emotional well-being.',
          durationMinutes: 50,
          price: 1800,
          isActive: true,
          isDefault: true,
        },
        {
          title: 'Initial Consultation & Assessment',
          description: 'Comprehensive 60-minute intake session to understand your background, presenting goals, and formulate a care roadmap.',
          durationMinutes: 60,
          price: 2200,
          isActive: true,
          isDefault: false,
        },
      ],
    },
    subscription: {
      tierKey: {
        type: String,
        enum: ['starter', 'growth', 'unlimited'],
        default: 'starter',
      },
      status: {
        type: String,
        enum: ['active', 'past_due', 'cancelled'],
        default: 'active',
      },
      currentPeriodEnd: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year free trial on signup
      },
    },
    billingDetails: {
      legalBusinessName: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      address: { type: String, default: '' },
      panNumber: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Method to verify password
therapistSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Static helper to hash password
therapistSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('Therapist', therapistSchema);
