const bcrypt = require('bcryptjs');
const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');
const entitlementService = require('../services/entitlementService');

const autoProvision = async () => {
  try {
    // 1. Ensure Subscription Tiers exist
    const tierCount = await SubscriptionTierConfig.countDocuments();
    if (tierCount === 0) {
      const defaults = Object.values(entitlementService.DEFAULT_TIER_CONFIGS);
      await SubscriptionTierConfig.insertMany(defaults);
      console.log('[Auto-Provision] Default Subscription Tiers initialized.');
    }

    // 2. Ensure Demo Practitioners exist with Password@123
    const defaultPassword = await Therapist.hashPassword('Password@123');

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
        subscription: { tierKey: 'growth', status: 'active' },
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
        name: 'Priya Nair',
        email: 'priya.nair@theraloom.in',
        password_hash: defaultPassword,
        slug: 'priya-nair',
        title: 'Trauma-Informed Psychotherapist & Somatic Practitioner',
        qualifications: 'M.A. Applied Psychology (TISS Mumbai)',
        bio: 'Integrative somatic therapist helping young adults deconstruct chronic stress, attachment wounds, and emotional burnout through gentle nervous system regulation.',
        specializations: ['Trauma & Somatic', 'People-Pleasing & Boundaries', 'Anxiety & Overthinking'],
        languages: ['English', 'Tamil', 'Hindi'],
        location: 'Adyar, Chennai (Online across India)',
        experienceYears: 6,
        consultationFee: 1800,
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        subscription: { tierKey: 'starter', status: 'active' },
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
        subscription: { tierKey: 'unlimited', status: 'active' },
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
    ];

    for (const tData of demoTherapists) {
      let therapist = await Therapist.findOne({ email: tData.email });
      if (!therapist) {
        therapist = await Therapist.create(tData);
        await Availability.create({ therapistId: therapist._id });
        console.log(`[Auto-Provision] Created demo therapist: ${tData.name} (${tData.email})`);
      } else {
        // Ensure slug and isActive are synchronized for public profile lookup
        let changed = false;
        if (therapist.slug !== tData.slug) {
          therapist.slug = tData.slug;
          changed = true;
        }
        if (!therapist.isActive) {
          therapist.isActive = true;
          changed = true;
        }
        if (!therapist.services || therapist.services.length === 0) {
          therapist.services = tData.services;
          changed = true;
        }
        if (changed) {
          await therapist.save();
          console.log(`[Auto-Provision] Synchronized slug and active status for ${tData.name}`);
        }
      }
    }
  } catch (err) {
    console.warn('[Auto-Provision Warning]', err.message);
  }
};

module.exports = autoProvision;
