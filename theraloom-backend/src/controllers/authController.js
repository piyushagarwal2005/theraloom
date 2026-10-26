const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const { getUniqueSlug } = require('../utils/generateSlug');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'theraloom_super_secure_jwt_secret_key_2026_india';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new therapist
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, title, specializations, consultationFee } = req.body;

    const existingUser = await Therapist.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Generate unique slug
    const slug = await getUniqueSlug(Therapist, name);

    // Hash password
    const password_hash = await Therapist.hashPassword(password);

    // Create therapist
    const therapist = await Therapist.create({
      name,
      email: email.toLowerCase(),
      password_hash,
      slug,
      title: title || 'Licensed Clinical Psychologist',
      specializations: specializations || ['Anxiety', 'Depression', 'Relationship Counseling'],
      consultationFee: consultationFee || 1800,
      subscription: {
        tierKey: 'starter',
        status: 'active',
      },
    });

    // Initialize default weekly availability for Monday - Friday (09:00 - 17:00)
    await Availability.create({
      therapistId: therapist._id,
      timezone: 'Asia/Kolkata',
      slotDuration: 50,
      bufferTimeMinutes: 10,
      weeklySchedule: [
        { dayOfWeek: 1, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Mon
        { dayOfWeek: 2, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Tue
        { dayOfWeek: 3, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Wed
        { dayOfWeek: 4, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Thu
        { dayOfWeek: 5, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Fri
        { dayOfWeek: 6, isAvailable: false, timeSlots: [] }, // Sat
        { dayOfWeek: 0, isAvailable: false, timeSlots: [] }, // Sun
      ],
      overrides: [],
      blockedDates: [],
    });

    const token = generateToken(therapist._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Theraloom.',
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        title: therapist.title,
        subscription: therapist.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in therapist
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const therapist = await Therapist.findOne({ email: email.toLowerCase() }).select('+password_hash');
    if (!therapist) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await therapist.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(therapist._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        title: therapist.title,
        profileImage: therapist.profileImage,
        subscription: therapist.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in therapist profile
// @route   GET /api/v1/auth/me
// @access  Private (Therapist)
exports.getMe = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.therapist._id);
    res.status(200).json({
      success: true,
      therapist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out therapist
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
