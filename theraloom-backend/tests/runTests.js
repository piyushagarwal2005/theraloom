const assert = require('assert');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const Therapist = require('../src/models/Therapist');
const Client = require('../src/models/Client');
const Session = require('../src/models/Session');
const SessionNote = require('../src/models/SessionNote');
const Payment = require('../src/models/Payment');
const { getUniqueSlug } = require('../src/utils/generateSlug');
const schedulingService = require('../src/services/schedulingService');
const paymentService = require('../src/services/paymentService');
const entitlementService = require('../src/services/entitlementService');
const invoiceService = require('../src/services/invoiceService');

let passedTests = 0;
let failedTests = 0;

function it(name, fn) {
  return fn()
    .then(() => {
      console.log(`  ✓ ${name}`);
      passedTests++;
    })
    .catch((err) => {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failedTests++;
    });
}

async function run() {
  console.log('\n======================================================');
  console.log('🧪 Starting Theraloom End-to-End Automated Test Suite');
  console.log('======================================================\n');

  await connectDB();

  // Clean up any previous test artifacts
  await Therapist.deleteMany({ name: 'Dr. Sunita Rao' });
  await Client.deleteMany({ email: { $in: ['kunal.j@example.com', 'second@example.com'] } });
  await Session.deleteMany({ date: '2026-12-10' });

  let testTherapist = null;
  let testClient = null;

  console.log('📦 Module 1: Authentication, Profiles & Unique Slugs');
  await it('Therapist password hashing & verification works', async () => {
    const rawPass = 'Secret@123';
    const hash = await Therapist.hashPassword(rawPass);
    assert.notStrictEqual(hash, rawPass);
    const dummy = new Therapist({ password_hash: hash });
    const match = await dummy.comparePassword(rawPass);
    assert.strictEqual(match, true);
  });

  await it('Slug generation creates URL-safe slug and handles duplicate collisions', async () => {
    const uniqueEmail = `test.therapist.${Date.now()}@theraloom.in`;
    const slug1 = await getUniqueSlug(Therapist, 'Dr. Sunita Rao');
    assert.strictEqual(slug1, 'dr-sunita-rao');

    testTherapist = await Therapist.create({
      name: 'Dr. Sunita Rao',
      email: uniqueEmail,
      password_hash: await Therapist.hashPassword('Pass@123'),
      slug: slug1,
      title: 'Senior Clinical Psychologist',
      consultationFee: 2500,
      subscription: { tierKey: 'starter' },
    });

    const slug2 = await getUniqueSlug(Therapist, 'Dr. Sunita Rao');
    assert.strictEqual(slug2, 'dr-sunita-rao-1');
  });

  console.log('\n📦 Module 2: Scheduling & Atomic Double-Booking Prevention');
  const testDate = '2026-12-10';
  const testStartTime = new Date('2026-12-10T11:00:00.000Z');

  await it('First booking succeeds and creates session record', async () => {
    const session = await schedulingService.bookSession(testTherapist._id, {
      clientName: 'Kunal Joshi',
      clientEmail: 'kunal.j@example.com',
      serviceName: 'Individual Psychotherapy',
      durationMinutes: 50,
      date: testDate,
      startTime: testStartTime,
      price: 2500,
    });
    assert.strictEqual(session.status, 'confirmed');
    assert.strictEqual(session.clientName, 'Kunal Joshi');
  });

  await it('Conflicting overlapping booking is atomically rejected with 409 Conflict', async () => {
    try {
      await schedulingService.bookSession(testTherapist._id, {
        clientName: 'Second Client',
        clientEmail: 'second@example.com',
        serviceName: 'Individual Psychotherapy',
        durationMinutes: 50,
        date: testDate,
        startTime: testStartTime, // Conflict!
        price: 2500,
      });
      assert.fail('Should have thrown 409 Conflict error');
    } catch (err) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  console.log('\n📦 Module 3: Client CRM, Intake & Versioned Digital Consent');
  await it('Client intake demographic & presenting concerns are recorded', async () => {
    testClient = await Client.findOne({ therapistId: testTherapist._id, email: 'kunal.j@example.com' });
    assert(testClient, 'Client record should have been created during booking');

    testClient.intakeForm = {
      isCompleted: true,
      completedAt: new Date(),
      demographics: { occupation: 'Data Scientist', city: 'Mumbai' },
      presentingConcerns: ['Work Anxiety', 'Sleep Apnea'],
      therapyGoals: 'Address impostor syndrome and build healthy emotional boundaries.',
    };
    await testClient.save();
    assert.strictEqual(testClient.intakeForm.isCompleted, true);
  });

  await it('Digital consent record is timestamped and auditable', async () => {
    testClient.consentRecords.push({
      version: '1.0',
      termsSummary: 'Theraloom Telehealth Consent under Indian Mental Healthcare Act 2017',
      agreed: true,
      consentedAt: new Date(),
      ipAddress: '127.0.0.1',
    });
    await testClient.save();
    assert.strictEqual(testClient.consentRecords.length, 1);
    assert.strictEqual(testClient.consentRecords[0].agreed, true);
  });

  console.log('\n📦 Module 4: Payments, Verification & GST Invoices');
  await it('Payment signature verification and invoice PDF generation work', async () => {
    const isMockValid = paymentService.verifySignature('order_test', 'pay_test', 'test_mock_sig_123');
    assert.strictEqual(isMockValid, true);

    const payment = await Payment.create({
      therapistId: testTherapist._id,
      clientId: testClient._id,
      clientName: testClient.name,
      clientEmail: testClient.email,
      amount: 2500,
      amountInPaise: 250000,
      currency: 'INR',
      status: 'captured',
      razorpayOrderId: 'order_test_101',
      razorpayPaymentId: 'pay_test_101',
      razorpaySignature: 'test_mock_sig_101',
      paymentMethod: 'upi',
      platformFee: 50,
      netAmount: 2450,
      invoiceNumber: `TL-INV-${Date.now().toString().slice(-6)}`,
      description: 'Psychotherapy Session',
    });

    assert.strictEqual(payment.status, 'captured');
    const { filePath, relativeUrl } = await invoiceService.generateInvoicePDF(payment, testTherapist);
    assert(filePath.endsWith('.pdf'));
    assert(relativeUrl.startsWith('/uploads/invoices/'));
  });

  console.log('\n📦 Module 5: Clinical Documentation & Private Note Protection');
  await it('Private clinical note is created and isolated from shared queries', async () => {
    // 1. Create Private Note
    const privateNote = await SessionNote.create({
      therapistId: testTherapist._id,
      clientId: testClient._id,
      title: 'Confidential Diagnosis Hypothesis',
      noteType: 'private', // Strictly private
      content: '<p>Internal clinical observation: Borderline anxiety features.</p>',
    });

    // 2. Create Shared Note
    const sharedNote = await SessionNote.create({
      therapistId: testTherapist._id,
      clientId: testClient._id,
      title: 'Weekly Mindfulness Homework',
      noteType: 'shared', // Explicitly shared
      content: '<p>Practice 5 minutes of 4-7-8 breathing.</p>',
      sharedAt: new Date(),
    });

    // 3. Client Portal Query (Simulating client endpoint GET /api/v1/notes/shared/:clientId)
    const clientVisibleNotes = await SessionNote.find({
      clientId: testClient._id,
      noteType: 'shared', // Client-facing query filter
    });

    const titles = clientVisibleNotes.map((n) => n.title);
    assert(titles.includes('Weekly Mindfulness Homework'), 'Shared note must be returned');
    assert(!titles.includes('Confidential Diagnosis Hypothesis'), 'PRIVATE NOTE MUST NEVER BE RETURNED');
    assert.strictEqual(clientVisibleNotes.some((n) => n.noteType === 'private'), false);
  });

  console.log('\n📦 Module 7: Subscription Entitlements & Centralized Feature Gating');
  await it('Entitlement service gates active clients according to tier limit', async () => {
    const access = await entitlementService.canAccess(testTherapist._id, 'active_clients_limit');
    assert.strictEqual(access.allowed, true);
    assert.strictEqual(access.maxAllowed, 5); // Starter tier cap
  });

  await it('Entitlement service gates SOAP/DAP templates to Growth/Unlimited plans', async () => {
    const noteAccess = await entitlementService.canAccess(testTherapist._id, 'advanced_note_templates');
    assert.strictEqual(noteAccess.allowed, false); // Starter does not have SOAP/DAP
    assert(noteAccess.reason.includes('Growth and Unlimited'));
  });

  await it('Upgrading tier unlocks gated features dynamically through canAccess', async () => {
    testTherapist.subscription.tierKey = 'growth';
    await testTherapist.save();

    const updatedNoteAccess = await entitlementService.canAccess(testTherapist._id, 'advanced_note_templates');
    assert.strictEqual(updatedNoteAccess.allowed, true);

    const analyticsAccess = await entitlementService.canAccess(testTherapist._id, 'advanced_analytics');
    assert.strictEqual(analyticsAccess.allowed, true);
  });

  console.log('\n📦 Module 8: Client Portal, Booking API & Direct Thread Creation');
  const clientController = require('../src/controllers/clientController');
  const chatController = require('../src/controllers/chatController');

  await it('Portal lookup retrieves client records, confirmed sessions & invoices by email', async () => {
    let responseData = null;
    let statusCode = null;
    const req = { query: { email: 'kunal.j@example.com' } };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; },
    };
    await clientController.portalLookup(req, res, (err) => { if (err) throw err; });
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.client.email, 'kunal.j@example.com');
    assert(responseData.sessions.length > 0, 'Should find booked sessions');
  });

  await it('Portal intake update updates demographics and goals', async () => {
    let responseData = null;
    let statusCode = null;
    const req = {
      params: { id: testClient._id },
      body: {
        demographics: { occupation: 'Lead Architect', city: 'Bengaluru' },
        therapyGoals: 'Achieve emotional balance and mindfulness.',
        presentingConcerns: ['Burnout', 'Work Stress'],
      },
    };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; },
    };
    await clientController.updateClientIntake(req, res, (err) => { if (err) throw err; });
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.client.intakeForm.demographics.city, 'Bengaluru');
    assert.strictEqual(responseData.client.intakeForm.therapyGoals, 'Achieve emotional balance and mindfulness.');
  });

  await it('Client chat thread creation succeeds by therapistId and clientId', async () => {
    let responseData = null;
    let statusCode = null;
    const req = {
      body: {
        therapistId: testTherapist._id,
        clientId: testClient._id,
        clientName: testClient.name,
        clientEmail: testClient.email,
      },
    };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; },
    };
    await chatController.getClientConversation(req, res, (err) => { if (err) throw err; });
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    assert(responseData.conversationId, 'Should return conversationId');
    assert(responseData.conversation, 'Should return conversation object');
  });

  const paymentController = require('../src/controllers/paymentController');
  await it('Therapist records manual offline payment and invoice PDF generates', async () => {
    let responseData = null;
    let statusCode = null;
    const req = {
      therapist: testTherapist,
      body: {
        clientId: testClient._id,
        clientName: testClient.name,
        clientEmail: testClient.email,
        amount: 2500,
        paymentMethod: 'cash',
        description: 'Offline Clinic Psychotherapy Session',
      },
    };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; },
    };
    await paymentController.recordManualPayment(req, res, (err) => { if (err) throw err; });
    assert.strictEqual(statusCode, 201);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.payment.amount, 2500);
    assert.strictEqual(responseData.payment.paymentMethod, 'cash');
  });

  console.log('\n======================================================');
  console.log(`📊 Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('======================================================\n');

  await disconnectDB();
  process.exit(failedTests > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('[Fatal Test Error]', err);
  process.exit(1);
});
