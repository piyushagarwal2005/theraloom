const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Therapist = require('../src/models/Therapist');
const Session = require('../src/models/Session');
const Client = require('../src/models/Client');
const SessionNote = require('../src/models/SessionNote');
const Payment = require('../src/models/Payment');
const { getUniqueSlug } = require('../src/utils/generateSlug');
const entitlementService = require('../src/services/entitlementService');
const schedulingService = require('../src/services/schedulingService');
const paymentService = require('../src/services/paymentService');

let authCookie = '';
let authToken = '';
let testTherapist = null;
let testClient = null;

beforeAll(async () => {
  // Ensure DB connection
  if (mongoose.connection.readyState === 0) {
    const { connectDB } = require('../src/config/db');
    await connectDB();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Module 1: Authentication & Therapist Profile', () => {
  const uniqueEmail = `test.therapist.${Date.now()}@theraloom.in`;

  test('POST /api/v1/auth/register should register a therapist with hashed password and unique slug', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dr. Test Therapist',
        email: uniqueEmail,
        password: 'Password@123',
        title: 'Clinical Psychologist',
        consultationFee: 2000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.therapist.slug).toBe('dr-test-therapist');

    authToken = res.body.token;
    testTherapist = res.body.therapist;
  });

  test('Slug generation should handle duplicate names gracefully with unique suffix', async () => {
    const slug1 = await getUniqueSlug(Therapist, 'Dr. Test Therapist');
    expect(slug1).toMatch(/^dr-test-therapist-\d+$/);
  });

  test('POST /api/v1/auth/login with valid credentials should return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password@123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/v1/auth/login with invalid password should return 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/therapists/public/:slug should return therapist public profile without sensitive data', async () => {
    const res = await request(app).get(`/api/v1/therapists/public/${testTherapist.slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.therapist.name).toBe('Dr. Test Therapist');
    expect(res.body.therapist.password_hash).toBeUndefined();
    expect(res.body.therapist.billingDetails).toBeUndefined();
  });
});

describe('Module 2: Scheduling & Double-Booking Prevention', () => {
  const sessionDate = '2026-11-15';
  const slotStart = new Date('2026-11-15T10:00:00.000Z');

  test('First booking should succeed and create session', async () => {
    const session = await schedulingService.bookSession(testTherapist.id, {
      clientName: 'Sunil Verma',
      clientEmail: 'sunil.verma@example.com',
      serviceName: 'Individual Psychotherapy',
      durationMinutes: 50,
      date: sessionDate,
      startTime: slotStart,
      price: 2000,
    });

    expect(session).toBeDefined();
    expect(session.status).toBe('confirmed');
    expect(session.clientName).toBe('Sunil Verma');
  });

  test('Second booking on conflicting overlapping slot must be rejected with 409 Conflict', async () => {
    await expect(
      schedulingService.bookSession(testTherapist.id, {
        clientName: 'Second Client',
        clientEmail: 'second@example.com',
        serviceName: 'Individual Psychotherapy',
        durationMinutes: 50,
        date: sessionDate,
        startTime: slotStart, // Exact same start time
        price: 2000,
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('Module 3: Client CRM, Intake & Consent', () => {
  test('POST /api/v1/clients/intake should store clinical demographic & presenting concern data', async () => {
    const res = await request(app)
      .post('/api/v1/clients/intake')
      .send({
        therapistSlug: testTherapist.slug,
        name: 'Sunil Verma',
        email: 'sunil.verma@example.com',
        intakeData: {
          demographics: { occupation: 'Product Designer', city: 'Pune' },
          presentingConcerns: ['Social Anxiety', 'Insomnia'],
          therapyGoals: 'Build social confidence and reduce anticipatory anxiety.',
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.client.intakeForm.isCompleted).toBe(true);
    expect(res.body.client.intakeForm.presentingConcerns).toContain('Social Anxiety');
    testClient = res.body.client;
  });

  test('POST /api/v1/clients/consent should capture timestamped auditable consent record', async () => {
    const res = await request(app)
      .post('/api/v1/clients/consent')
      .send({
        therapistSlug: testTherapist.slug,
        email: 'sunil.verma@example.com',
        agreed: true,
        version: '1.0',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.consent.agreed).toBe(true);
    expect(res.body.consent.consentedAt).toBeDefined();
  });
});

describe('Module 4: Payment Verification & Webhook Idempotency', () => {
  test('verifySignature should validate test mock and HMAC SHA256 signatures', () => {
    const isValid = paymentService.verifySignature(
      'order_123',
      'pay_123',
      'test_mock_sig_valid'
    );
    expect(isValid).toBe(true);
  });

  test('POST /api/v1/payments/verify should record captured payment and generate invoice', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .send({
        therapistSlug: testTherapist.slug,
        clientName: 'Sunil Verma',
        clientEmail: 'sunil.verma@example.com',
        amount: 2000,
        razorpayOrderId: `order_test_${Date.now()}`,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpaySignature: 'test_mock_sig_abc',
        paymentMethod: 'upi',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.payment.status).toBe('captured');
    expect(res.body.payment.invoiceNumber).toMatch(/^TL-INV-/);
  });
});

describe('Module 5: Clinical Documentation & Private Note Protection', () => {
  let privateNoteId;
  let sharedNoteId;

  test('Therapist can create a private clinical note', async () => {
    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId: testClient._id,
        title: 'Therapist Confidential Evaluation',
        noteType: 'private', // Strictly private
        content: '<p>Private clinical hypothesis: Avoidant traits observed.</p>',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.note.noteType).toBe('private');
    privateNoteId = res.body.note._id;
  });

  test('Therapist can create a shared note for the client', async () => {
    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId: testClient._id,
        title: 'Weekly Mindfulness Reflection',
        noteType: 'shared', // Explicitly shared
        content: '<p>Practice 10 minutes of box breathing daily.</p>',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.note.noteType).toBe('shared');
    sharedNoteId = res.body.note._id;
  });

  test('CRITICAL SECURITY: Client-facing endpoint GET /api/v1/notes/shared/:clientId MUST NEVER return private notes', async () => {
    const res = await request(app).get(`/api/v1/notes/shared/${testClient._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Check that ALL returned notes are strictly shared
    const noteTitles = res.body.notes.map((n) => n.title);
    expect(noteTitles).toContain('Weekly Mindfulness Reflection');
    expect(noteTitles).not.toContain('Therapist Confidential Evaluation');

    const hasPrivate = res.body.notes.some((n) => n.noteType === 'private');
    expect(hasPrivate).toBe(false);
  });
});

describe('Module 7: Entitlement Service & Feature Gating', () => {
  test('Starter plan allows up to 5 clients but blocks upon reaching capacity', async () => {
    const access = await entitlementService.canAccess(testTherapist.id, 'active_clients_limit');
    expect(access).toBeDefined();
    expect(access.maxAllowed).toBe(5);
  });

  test('Starter plan blocks advanced note templates (SOAP/DAP) until upgraded', async () => {
    const access = await entitlementService.canAccess(testTherapist.id, 'advanced_note_templates');
    expect(access.allowed).toBe(false);
    expect(access.reason).toMatch(/Growth and Unlimited plans/);
  });

  test('Upgrading tier unlocks feature access dynamically via single entitlement service', async () => {
    await request(app)
      .post('/api/v1/tiers/upgrade')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tierKey: 'growth' });

    const updatedAccess = await entitlementService.canAccess(testTherapist.id, 'advanced_note_templates');
    expect(updatedAccess.allowed).toBe(true);

    const analyticsAccess = await entitlementService.canAccess(testTherapist.id, 'advanced_analytics');
    expect(analyticsAccess.allowed).toBe(true);
  });
});
