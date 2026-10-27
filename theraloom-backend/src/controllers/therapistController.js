const bcrypt = require('bcryptjs');
const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const { getUniqueSlug } = require('../utils/generateSlug');

// Auto-provision initial accredited therapists if database is empty
const autoProvisionDefaultTherapists = async () => {
  try {
    const count = await Therapist.countDocuments();
    if (count > 0) return;

    const defaultPassword = await bcrypt.hash('Password@123', 10);
    const demoTherapists = [
      {
        name: 'Dr. Ananya Sharma',
        email: 'ananya.sharma@theraloom.in',
        password_hash: defaultPassword,
        slug: 'dr-ananya-sharma',
        title: 'Licensed Clinical Psychologist (RCI Registered)',
        qualifications: 'M.Phil in Clinical Psychology (NIMHANS, Bengaluru)',
        bio: 'Compassionate, evidence-grounded psychologist with 9+ years of experience specializing in cognitive behavioral therapy (CBT), acceptance and commitment therapy (ACT), and compassion-focused inner child work. I offer a trauma-informed, safe, and confidential space for adults navigating anxiety, depressive episodes, relationship cross-roads, and professional burnout.',
        specializations: ['People-Pleasing & Boundaries', 'Anxiety & Overthinking', 'Trauma & Somatic', 'Burnout & Exhaustion', 'Couples Therapy'],
        languages: ['English', 'Hindi'],
        location: 'Bandra West, Mumbai (Online across India)',
        experienceYears: 9,
        consultationFee: 2200,
        profileImage: 'https://images.unsplash.com/photo-1594824813572-c51f38e2ec11?auto=format&fit=crop&q=80&w=400',
        coverImage: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&q=80&w=1200',
        services: [
          {
            title: 'Individual Psychotherapy',
            description: 'Comprehensive 50-minute evidence-based session focusing on anxiety, mood regulation, and personalized coping strategies.',
            durationMinutes: 50,
            price: 2200,
            isActive: true,
            isDefault: true,
          },
          {
            title: 'Couples / Relationship Therapy',
            description: '75-minute structured dialogue session to repair communication breakdowns, foster emotional safety, and rebuild intimacy.',
            durationMinutes: 75,
            price: 3600,
            isActive: true,
            isDefault: false,
          },
        ],
      },
      {
        name: 'Dr. Rajesh Menon',
        email: 'rajesh.menon@theraloom.in',
        password_hash: defaultPassword,
        slug: 'dr-rajesh-menon',
        title: 'Senior Psychotherapist & Family Counselor',
        qualifications: 'M.Sc. Counseling Psychology, Ph.D. (Univ of Delhi)',
        bio: 'Dedicated relationship and trauma therapist with 12+ years of clinical depth. Specializing in family systems, couples communication, and attachment injury repair.',
        specializations: ['Couples Therapy', 'Attachment & Relationships', 'Burnout & Exhaustion'],
        languages: ['English', 'Hindi', 'Malayalam'],
        location: 'Indiranagar, Bengaluru (Online across India)',
        experienceYears: 12,
        consultationFee: 2500,
        profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        services: [
          {
            title: 'Couples & Relational Counseling',
            description: 'Systemic relationship counseling for communication blocks and conflict.',
            durationMinutes: 60,
            price: 2500,
            isActive: true,
            isDefault: true,
          },
        ],
      },
      {
        name: 'Pooja Nair',
        email: 'pooja.nair@theraloom.in',
        password_hash: defaultPassword,
        slug: 'pooja-nair',
        title: 'Trauma-Informed Psychotherapist & Somatic Practitioner',
        qualifications: 'M.A. Applied Psychology (TISS Mumbai)',
        bio: 'Integrative somatic therapist helping young adults deconstruct chronic stress, attachment wounds, and emotional burnout through gentle nervous system regulation.',
        specializations: ['Trauma & Somatic', 'People-Pleasing & Boundaries', 'Anxiety & Overthinking'],
        languages: ['English', 'Tamil', 'Hindi'],
        location: 'Adyar, Chennai (Online across India)',
        experienceYears: 6,
        consultationFee: 1800,
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        services: [
          {
            title: 'Somatic & Inner Child Therapy',
            description: 'Gentle nervous system and somatic regulation session.',
            durationMinutes: 50,
            price: 1800,
            isActive: true,
            isDefault: true,
          },
        ],
      },
    ];

    for (const tData of demoTherapists) {
      const exists = await Therapist.findOne({ slug: tData.slug });
      if (!exists) {
        const created = await Therapist.create(tData);
        await Availability.create({ therapistId: created._id });
      }
    }
    console.log('[Auto-Provision] Default demo therapists created in database');
  } catch (err) {
    console.warn('[Auto-Provision Warning]', err.message);
  }
};

// @desc    Get therapist public profile by slug
// @route   GET /api/v1/therapists/public/:slug
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true })
      .select('-password_hash -billingDetails');

    if (!therapist) {
      // If therapist not found, check if database is empty and auto-provision
      const count = await Therapist.countDocuments();
      if (count === 0) {
        await autoProvisionDefaultTherapists();
        therapist = await Therapist.findOne({ slug: slug.toLowerCase(), isActive: true })
          .select('-password_hash -billingDetails');
      }
    }

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
    let therapists = await Therapist.find({ isActive: true })
      .select('name slug title qualifications specializations languages consultationFee profileImage location experienceYears services')
      .sort({ createdAt: -1 });

    if (therapists.length === 0) {
      await autoProvisionDefaultTherapists();
      therapists = await Therapist.find({ isActive: true })
        .select('name slug title qualifications specializations languages consultationFee profileImage location experienceYears services')
        .sort({ createdAt: -1 });
    }

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
