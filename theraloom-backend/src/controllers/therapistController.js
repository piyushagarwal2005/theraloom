const Therapist = require('../models/Therapist');
const { getUniqueSlug } = require('../utils/generateSlug');

// @desc    Get therapist public profile by slug
// @route   GET /api/v1/therapists/public/:slug
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true })
      .select('-password_hash -billingDetails');

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: `Therapist profile '/${slug}' not found.`,
      });
    }

    res.status(200).json({
      success: true,
      therapist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all active therapists for directory/discovery
// @route   GET /api/v1/therapists/public
// @access  Public
exports.getPublicTherapists = async (req, res, next) => {
  try {
    const therapists = await Therapist.find({ isActive: true })
      .select('name slug title qualifications specializations languages consultationFee profileImage location experienceYears')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: therapists.length,
      therapists,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update therapist profile
// @route   PUT /api/v1/therapists/profile
// @access  Private (Therapist)
exports.updateProfile = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    const {
      name,
      title,
      qualifications,
      bio,
      specializations,
      languages,
      phone,
      location,
      experienceYears,
      consultationFee,
      services,
      billingDetails,
      socialLinks,
      customSlug,
    } = req.body;

    if (name) therapist.name = name;
    if (title !== undefined) therapist.title = title;
    if (qualifications !== undefined) therapist.qualifications = qualifications;
    if (bio !== undefined) therapist.bio = bio;
    if (specializations) therapist.specializations = specializations;
    if (languages) therapist.languages = languages;
    if (phone !== undefined) therapist.phone = phone;
    if (location !== undefined) therapist.location = location;
    if (experienceYears !== undefined) therapist.experienceYears = experienceYears;
    if (consultationFee !== undefined) therapist.consultationFee = consultationFee;
    if (services) therapist.services = services;
    if (billingDetails) therapist.billingDetails = { ...therapist.billingDetails, ...billingDetails };
    if (socialLinks) therapist.socialLinks = { ...therapist.socialLinks, ...socialLinks };

    // Update slug if therapist explicitly requests a custom slug
    if (customSlug && customSlug !== therapist.slug) {
      therapist.slug = await getUniqueSlug(Therapist, customSlug, therapist._id);
    }

    await therapist.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      therapist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload therapist profile image
// @route   POST /api/v1/therapists/avatar
// @access  Private (Therapist)
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (JPEG, PNG, or WebP).',
      });
    }

    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    // Relative web URL served via express static /uploads/
    const imageUrl = `/uploads/${req.file.filename}`;
    therapist.profileImage = imageUrl;
    await therapist.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully.',
      profileImage: imageUrl,
    });
  } catch (error) {
    next(error);
  }
};
