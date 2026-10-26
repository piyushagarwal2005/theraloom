const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const { connectDB } = require('../config/db');
const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const Client = require('../models/Client');
const Session = require('../models/Session');
const SessionNote = require('../models/SessionNote');
const Package = require('../models/Package');
const ClientPackage = require('../models/ClientPackage');
const Payment = require('../models/Payment');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');
const { generateInvoicePDF } = require('../services/invoiceService');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Cleaning existing test collections...');

    await Promise.all([
      Therapist.deleteMany({}),
      Availability.deleteMany({}),
      Client.deleteMany({}),
      Session.deleteMany({}),
      SessionNote.deleteMany({}),
      Package.deleteMany({}),
      ClientPackage.deleteMany({}),
      Payment.deleteMany({}),
      SubscriptionTierConfig.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Subscription Tier Configurations...');
    const tiers = await SubscriptionTierConfig.insertMany([
      {
        tierKey: 'starter',
        name: 'Starter Practice',
        tagline: 'Ideal for solo practitioners starting their independent journey',
        monthlyPrice: 0,
        maxActiveClients: 5,
        advancedNoteTemplates: false,
        analyticsDepth: 'basic',
        customBranding: false,
        isPopular: false,
        features: [
          'Up to 5 active clients',
          'Standard booking calendar & public link',
          'Freeform clinical session notes',
          'Automated appointment confirmations',
          'Razorpay payment collection',
        ],
      },
      {
        tierKey: 'growth',
        name: 'Growth Practice',
        tagline: 'Empowering established therapists with compliance & structured care',
        monthlyPrice: 1499,
        maxActiveClients: 30,
        advancedNoteTemplates: true,
        analyticsDepth: 'advanced',
        customBranding: true,
        isPopular: true,
        features: [
          'Up to 30 active clients',
          'Structured SOAP & DAP clinical templates',
          'Comprehensive analytics & no-show rate metrics',
          'Custom slug & branded client portal',
          'Multi-session packages & automated GST invoices',
          'Automated WhatsApp booking reminders (stubbed)',
        ],
      },
      {
        tierKey: 'unlimited',
        name: 'Unlimited Clinic',
        tagline: 'Full-scale practice suite for high-volume consultants & clinics',
        monthlyPrice: 2999,
        maxActiveClients: 99999,
        advancedNoteTemplates: true,
        analyticsDepth: 'advanced',
        customBranding: true,
        isPopular: false,
        features: [
          'Unlimited active clients',
          'All SOAP, DAP & custom note frameworks',
          'Deep multi-year revenue trends & analytics export',
          'Priority client CRM & custom intake builder',
          'Unlimited multi-session packages',
          'Dedicated practice support',
        ],
      },
    ]);

    console.log('[Seed] Seeding Therapist Profiles...');
    const defaultPassword = await bcrypt.hash('Password@123', 10);

    const drAnanya = await Therapist.create({
      name: 'Dr. Ananya Sharma',
      email: 'ananya.sharma@theraloom.in',
      password_hash: defaultPassword,
      slug: 'dr-ananya-sharma',
      title: 'Licensed Clinical Psychologist (RCI Registered)',
      qualifications: 'M.Phil in Clinical Psychology (NIMHANS, Bengaluru)',
      bio: 'Compassionate, evidence-grounded psychologist with 9+ years of experience specializing in cognitive behavioral therapy (CBT), acceptance and commitment therapy (ACT), and compassion-focused inner child work. I offer a trauma-informed, safe, and confidential space for adults navigating anxiety, depressive episodes, relationship cross-roads, and professional burnout.',
      specializations: ['Anxiety & Panic Disorders', 'Depression', 'Trauma & PTSD', 'Workplace Burnout', 'Relationship Dynamics'],
      languages: ['English', 'Hindi'],
      phone: '+91 98201 12345',
      location: 'Bandra West, Mumbai (Online across India)',
      experienceYears: 9,
      consultationFee: 2200,
      profileImage: 'https://images.unsplash.com/photo-1594824813572-c51f38e2ec11?auto=format&fit=crop&q=80&w=400',
      coverImage: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&q=80&w=1200',
      subscription: {
        tierKey: 'growth',
        status: 'active',
      },
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
        {
          title: 'Initial Intake & Assessment',
          description: 'Detailed 60-minute intake session exploring personal developmental history, presenting concerns, and co-creating a treatment roadmap.',
          durationMinutes: 60,
          price: 2600,
          isActive: true,
          isDefault: false,
        },
      ],
      billingDetails: {
        legalBusinessName: 'Aura Psychological Services LLP',
        gstNumber: '27AABCU9603R1ZX',
        address: 'Hill Road, Bandra West, Mumbai, MH 400050',
        panNumber: 'AABCU9603R',
        upiId: 'ananya.sharma@okaxis',
      },
    });

    const drRajesh = await Therapist.create({
      name: 'Dr. Rajesh Menon',
      email: 'rajesh.menon@theraloom.in',
      password_hash: defaultPassword,
      slug: 'dr-rajesh-menon',
      title: 'Senior Consultant Psychotherapist',
      qualifications: 'Ph.D. in Clinical Psychology (DU), Fellow of IACP',
      bio: 'Senior therapist with 14 years of clinical practice helping clients navigate grief, life transitions, and chronic stress through an integrative psychodynamic and mindfulness approach.',
      specializations: ['Grief & Loss', 'Mid-life Transitions', 'Depression', 'Existential Therapy'],
      languages: ['English', 'Hindi', 'Malayalam'],
      phone: '+91 98450 67890',
      location: 'Indiranagar, Bengaluru',
      experienceYears: 14,
      consultationFee: 2800,
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      subscription: { tierKey: 'unlimited', status: 'active' },
    });

    const priyaNair = await Therapist.create({
      name: 'Priya Nair',
      email: 'priya.nair@theraloom.in',
      password_hash: defaultPassword,
      slug: 'priya-nair',
      title: 'Counseling Psychologist & Youth Specialist',
      qualifications: 'M.Sc Counseling Psychology (Christ University)',
      bio: 'Energetic and empathetic counseling psychologist focusing on young adults, college students, career transitions, and emotional boundary setting.',
      specializations: ['Young Adult Mental Health', 'ADHD & Focus', 'Academic Stress', 'Self-Esteem'],
      languages: ['English', 'Hindi', 'Tamil'],
      phone: '+91 97110 54321',
      location: 'South Extension, New Delhi',
      experienceYears: 6,
      consultationFee: 1600,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      subscription: { tierKey: 'starter', status: 'active' },
    });

    console.log('[Seed] Seeding Availability Schedules...');
    await Availability.create({
      therapistId: drAnanya._id,
      timezone: 'Asia/Kolkata',
      slotDuration: 50,
      bufferTimeMinutes: 10,
      weeklySchedule: [
        { dayOfWeek: 1, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '15:00', endTime: '19:00' }] },
        { dayOfWeek: 2, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '15:00', endTime: '19:00' }] },
        { dayOfWeek: 3, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '15:00', endTime: '19:00' }] },
        { dayOfWeek: 4, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '15:00', endTime: '19:00' }] },
        { dayOfWeek: 5, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 6, isAvailable: true, timeSlots: [{ startTime: '10:00', endTime: '14:00' }] },
        { dayOfWeek: 0, isAvailable: false, timeSlots: [] },
      ],
    });

    console.log('[Seed] Seeding Packages for Dr. Ananya...');
    const pkg3 = await Package.create({
      therapistId: drAnanya._id,
      title: 'Foundation Care (3 Sessions)',
      sessionCount: 3,
      price: 6070,
      discountPercentage: 8,
      validityDays: 60,
      description: 'Ideal for short-term goal-focused coping strategies, acute stress relief, and actionable habit shifts.',
    });

    const pkg6 = await Package.create({
      therapistId: drAnanya._id,
      title: 'Transformation Journey (6 Sessions)',
      sessionCount: 6,
      price: 11220,
      discountPercentage: 15,
      validityDays: 120,
      description: 'Our most popular package for addressing anxiety, self-worth, deep-rooted patterns, and relationship challenges.',
    });

    console.log('[Seed] Seeding CRM Clients & Consent Records...');
    const clientAarav = await Client.create({
      therapistId: drAnanya._id,
      name: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '+91 98200 11111',
      status: 'active',
      tags: ['anxiety', 'tech-worker', 'package-holder'],
      intakeForm: {
        isCompleted: true,
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        demographics: { occupation: 'Senior Software Engineer', maritalStatus: 'Single', city: 'Bengaluru' },
        presentingConcerns: ['Workplace Anxiety', 'Panic Attacks', 'Sleep Insomnia'],
        therapyGoals: 'Learn grounding techniques to prevent panic attacks before meetings and establish healthy boundaries with work.',
        priorTherapyExperience: 'Brief counseling 3 years ago',
        medicalHistory: 'No chronic physical illness. Mild hypertension under control.',
        emergencyContact: { name: 'Sunita Mehta', relation: 'Mother', phone: '+91 98200 22222' },
      },
      consentRecords: [
        {
          version: '1.0',
          termsSummary: 'Theraloom Tele-Mental Health & Confidentiality Consent (Under Indian Mental Healthcare Act 2017)',
          agreed: true,
          consentedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          ipAddress: '103.21.124.5',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
      ],
      lastSessionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    const clientNeha = await Client.create({
      therapistId: drAnanya._id,
      name: 'Neha Patel',
      email: 'neha.patel@example.com',
      phone: '+91 98333 44444',
      status: 'active',
      tags: ['depression', 'grief', 'student'],
      intakeForm: {
        isCompleted: true,
        completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        demographics: { occupation: 'Master Student in Literature', maritalStatus: 'Single', city: 'Mumbai' },
        presentingConcerns: ['Depressive episodes', 'Low Motivation', 'Grief over family loss'],
        therapyGoals: 'Rebuild self-worth, find routine momentum, and process bereavement gently.',
      },
      consentRecords: [
        {
          version: '1.0',
          termsSummary: 'Tele-psychotherapy consent',
          agreed: true,
          consentedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          ipAddress: '115.112.44.18',
        },
      ],
      lastSessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const clientRohan = await Client.create({
      therapistId: drAnanya._id,
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@example.com',
      phone: '+91 98999 55555',
      status: 'active',
      tags: ['couples-therapy'],
      intakeForm: {
        isCompleted: true,
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('[Seed] Seeding Sessions and Payments...');
    // Completed session 1 (Aarav)
    const session1 = await Session.create({
      therapistId: drAnanya._id,
      clientId: clientAarav._id,
      clientName: clientAarav.name,
      clientEmail: clientAarav.email,
      clientPhone: clientAarav.phone,
      serviceName: 'Individual Psychotherapy',
      durationMinutes: 50,
      date: '2026-10-18',
      startTime: new Date('2026-10-18T10:00:00.000Z'),
      endTime: new Date('2026-10-18T10:50:00.000Z'),
      status: 'completed',
      price: 2200,
      paymentStatus: 'paid',
      meetingLink: 'https://meet.jit.si/theraloom-ananya-aarav1',
    });

    const payment1 = await Payment.create({
      therapistId: drAnanya._id,
      clientId: clientAarav._id,
      sessionId: session1._id,
      clientName: clientAarav.name,
      clientEmail: clientAarav.email,
      amount: 2200,
      amountInPaise: 220000,
      currency: 'INR',
      status: 'captured',
      razorpayOrderId: 'order_test_aarav_001',
      razorpayPaymentId: 'pay_test_aarav_001',
      paymentMethod: 'upi',
      platformFee: 44,
      netAmount: 2156,
      invoiceNumber: 'TL-INV-2026-1001',
      description: 'Individual Psychotherapy Session',
    });
    session1.paymentId = payment1._id;
    await session1.save();
    try {
      const inv = await generateInvoicePDF(payment1, drAnanya);
      payment1.invoiceUrl = inv.relativeUrl;
      await payment1.save();
    } catch (e) {
      console.warn('PDF invoice notice:', e.message);
    }

    // Completed session 2 (Neha)
    const session2 = await Session.create({
      therapistId: drAnanya._id,
      clientId: clientNeha._id,
      clientName: clientNeha.name,
      clientEmail: clientNeha.email,
      serviceName: 'Individual Psychotherapy',
      durationMinutes: 50,
      date: '2026-10-22',
      startTime: new Date('2026-10-22T15:00:00.000Z'),
      endTime: new Date('2026-10-22T15:50:00.000Z'),
      status: 'completed',
      price: 2200,
      paymentStatus: 'paid',
      meetingLink: 'https://meet.jit.si/theraloom-ananya-neha2',
    });

    const payment2 = await Payment.create({
      therapistId: drAnanya._id,
      clientId: clientNeha._id,
      sessionId: session2._id,
      clientName: clientNeha.name,
      clientEmail: clientNeha.email,
      amount: 2200,
      amountInPaise: 220000,
      currency: 'INR',
      status: 'captured',
      razorpayOrderId: 'order_test_neha_002',
      razorpayPaymentId: 'pay_test_neha_002',
      paymentMethod: 'card',
      platformFee: 44,
      netAmount: 2156,
      invoiceNumber: 'TL-INV-2026-1002',
      description: 'Individual Psychotherapy Session',
    });
    session2.paymentId = payment2._id;
    await session2.save();

    // Upcoming Confirmed session (Aarav tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    const sessionUpcoming = await Session.create({
      therapistId: drAnanya._id,
      clientId: clientAarav._id,
      clientName: clientAarav.name,
      clientEmail: clientAarav.email,
      serviceName: 'Individual Psychotherapy',
      durationMinutes: 50,
      date: tomorrowDateStr,
      startTime: new Date(`${tomorrowDateStr}T10:00:00.000Z`),
      endTime: new Date(`${tomorrowDateStr}T10:50:00.000Z`),
      status: 'confirmed',
      price: 2200,
      paymentStatus: 'paid',
      meetingLink: 'https://meet.jit.si/theraloom-ananya-aarav-upcoming',
    });

    console.log('[Seed] Seeding Clinical Notes (Private vs Shared with SOAP/DAP)...');
    // Note 1: SOAP Note (Private therapist-only)
    await SessionNote.create({
      therapistId: drAnanya._id,
      clientId: clientAarav._id,
      sessionId: session1._id,
      title: 'Session 1: CBT Assessment & Panic Baseline',
      noteType: 'private', // STRICTLY PRIVATE
      format: 'SOAP',
      soapData: {
        subjective: 'Client reports sudden onset panic episodes occurring 3x this week, typically preceding stakeholder sprint reviews. Describes somatic sensation of chest tightness, hyperventilation, and catastrophic dread ("I will lose control in front of my team").',
        objective: 'Client was cooperative, articulate, well-oriented x4. Evident motor restlessness (frequent shifting, leg tapping). Thought process logical, goal-directed. Denies suicidal or self-harm ideation.',
        assessment: 'Panic Disorder with situational agoraphobic features exacerbated by acute corporate stress. Good insight and high treatment motivation.',
        plan: '1. Psychoeducation on the sympathetic nervous system fight-or-flight cycle. 2. Introduced 4-7-8 diaphragmatic breathing and 5-4-3-2-1 sensory grounding. 3. Homework: Daily thought log tracking cognitive distortions before meetings. 4. Next session: Tuesday 10:00 AM.',
      },
      content: '<p><strong>Subjective:</strong> Client reports severe presentation anxiety.</p><p><strong>Objective:</strong> Motor restlessness, logical thought process.</p><p><strong>Assessment:</strong> Panic disorder secondary to occupational burnout.</p><p><strong>Plan:</strong> CBT thought records, diaphragmatic breathing.</p>',
    });

    // Note 2: Shared Takeaways Note (Shared with client!)
    await SessionNote.create({
      therapistId: drAnanya._id,
      clientId: clientAarav._id,
      sessionId: session1._id,
      title: 'Grounding Exercises & Weekly Action Plan (Shared)',
      noteType: 'shared', // EXPLICITLY SHARED WITH CLIENT
      format: 'freeform',
      content: `
        <h2>Key Takeaways & Practices for This Week</h2>
        <p>Dear Aarav, here are the core anchoring exercises we agreed on during our session:</p>
        <ul>
          <li><strong>The 4-7-8 Diaphragmatic Breath:</strong> Inhale gently through nose for 4 seconds, hold for 7 seconds, exhale slowly with whoosh sound for 8 seconds. Repeat 4 cycles whenever heart rate increases.</li>
          <li><strong>5-4-3-2-1 Sensory Grounding:</strong> Name 5 things you can see, 4 you can physically feel, 3 sounds you can hear, 2 scents, and 1 positive affirmation.</li>
          <li><strong>Thought Record Reflection:</strong> When you notice the thought "I'm going to freeze", write down: <em>What is the realistic worst-case? What is the most likely outcome? Have I ever handled this before?</em></li>
        </ul>
        <blockquote>"Anxiety is a messenger that we care deeply, not proof that danger is imminent."</blockquote>
      `,
      sharedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    // Note 3: DAP Note (Private for Neha)
    await SessionNote.create({
      therapistId: drAnanya._id,
      clientId: clientNeha._id,
      sessionId: session2._id,
      title: 'Session 1: Bereavement & Behavioral Activation',
      noteType: 'private',
      format: 'DAP',
      dapData: {
        data: 'Discussed maternal grandmother passing 4 months ago. Client struggles to get out of bed on weekends; reporting anhedonia and social withdrawal from campus peers.',
        assessment: 'Prolonged grief reaction accompanied by mild-to-moderate depressive symptoms (PHQ-9 baseline: 14).',
        plan: 'Behavioral activation schedule focusing on micro-steps: 15-minute morning sunlight walk, journaling memory letter to grandmother.',
      },
      content: '<p>Private clinical reflection: Monitor sleep hygiene and support network on campus.</p>',
    });

    console.log('[Seed] Database successfully seeded with realistic Indian therapy practice data!');
    console.log('[Seed] Demo Therapist Login:');
    console.log('       Email: ananya.sharma@theraloom.in');
    console.log('       Password: Password@123');
    console.log('       Public Profile: http://localhost:5173/dr-ananya-sharma');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedData();
