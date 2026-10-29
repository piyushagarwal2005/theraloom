const Payment = require('../models/Payment');
const Package = require('../models/Package');
const ClientPackage = require('../models/ClientPackage');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const paymentService = require('../services/paymentService');
const invoiceService = require('../services/invoiceService');
const notificationService = require('../services/notificationService');
const path = require('path');
const fs = require('fs');

// @desc    Create Razorpay Order for a session or package
// @route   POST /api/v1/payments/create-order
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const { therapistSlug, therapistId, amount, type, sessionId, packageId, clientName, clientEmail } = req.body;

    let therapist = null;
    if (therapistId) {
      therapist = await Therapist.findById(therapistId);
    } else if (therapistSlug) {
      therapist = await Therapist.findOne({ slug: therapistSlug.toLowerCase() });
    }

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    const orderData = await paymentService.createOrder({
      amount: Number(amount),
      receipt: `rcpt_${Date.now()}`,
      notes: {
        therapistId: therapist._id.toString(),
        type: type || 'session',
        clientEmail,
      },
    });

    res.status(200).json({
      success: true,
      order: orderData,
      data: orderData,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_theraloom_key123',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and record captured transaction
// @route   POST /api/v1/payments/verify
// @access  Public
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      therapistSlug,
      therapistId,
      clientName,
      clientEmail,
      amount,
      sessionId,
      packageId,
      paymentMethod = 'upi',
    } = req.body;

    // Verify signature
    const isValid = paymentService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    let therapist = null;
    if (therapistId) {
      therapist = await Therapist.findById(therapistId);
    } else if (therapistSlug) {
      therapist = await Therapist.findOne({ slug: therapistSlug.toLowerCase() });
    }

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    // Check if client exists or create
    let client = await Client.findOne({
      therapistId: therapist._id,
      email: clientEmail.toLowerCase(),
    });

    if (!client) {
      client = await Client.create({
        therapistId: therapist._id,
        name: clientName,
        email: clientEmail.toLowerCase(),
        status: 'active',
      });
    }

    // Check idempotency: avoid duplicate payment records
    let payment = await Payment.findOne({ razorpayPaymentId });
    if (!payment) {
      const invoiceNumber = `TL-INV-${Date.now().toString().slice(-6)}`;
      const parsedAmount = Number(amount);
      const platformFee = Math.round(parsedAmount * 0.02); // 2% platform fee

      payment = new Payment({
        therapistId: therapist._id,
        clientId: client._id,
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        sessionId: sessionId || null,
        packageId: packageId || null,
        amount: parsedAmount,
        amountInPaise: Math.round(parsedAmount * 100),
        currency: 'INR',
        status: 'captured',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod,
        platformFee,
        netAmount: parsedAmount - platformFee,
        invoiceNumber,
        description: packageId ? 'Therapy Package Subscription' : 'Psychotherapy Session Consultation',
      });

      // Generate PDF Invoice
      try {
        const { relativeUrl } = await invoiceService.generateInvoicePDF(payment, therapist);
        payment.invoiceUrl = relativeUrl;
      } catch (pdfErr) {
        console.warn('[Invoice] PDF Generation error:', pdfErr.message);
      }

      await payment.save();

      // If tied to a session, update session status
      if (sessionId) {
        await Session.findByIdAndUpdate(sessionId, {
          paymentStatus: 'paid',
          paymentId: payment._id,
          status: 'confirmed',
        });
      }

      // If purchase of a package, create ClientPackage
      if (packageId) {
        const pkg = await Package.findById(packageId);
        if (pkg) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + (pkg.validityDays || 90));

          const clientPkg = await ClientPackage.create({
            therapistId: therapist._id,
            clientId: client._id,
            packageId: pkg._id,
            title: pkg.title,
            totalSessions: pkg.sessionCount,
            remainingSessions: pkg.sessionCount,
            expiryDate,
            paymentId: payment._id,
            status: 'active',
          });
          payment.clientPackageId = clientPkg._id;
          await payment.save();
        }
      }

      // Fire payment notification event
      try {
        await notificationService.notifyPaymentSuccess(payment);
      } catch (e) {
        console.warn('[Notification Error]', e.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and confirmed successfully!',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler with Raw Body & Signature Verification
// @route   POST /api/v1/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook] Received event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      if (paymentEntity) {
        // Idempotency check
        const existing = await Payment.findOne({ razorpayPaymentId: paymentEntity.id });
        if (existing && existing.status === 'captured') {
          return res.status(200).json({ success: true, message: 'Duplicate webhook event ignored.' });
        }
      }
    }

    res.status(200).json({ success: true, received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for logged in therapist
// @route   GET /api/v1/payments
// @access  Private (Therapist)
exports.getTherapistPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ therapistId: req.therapist._id })
      .populate('clientId', 'name email phone avatarUrl')
      .populate('sessionId')
      .sort({ createdAt: -1 });

    const totalRevenue = payments.reduce((acc, p) => (p.status === 'captured' ? acc + p.amount : acc), 0);
    const totalNetRevenue = payments.reduce((acc, p) => (p.status === 'captured' ? acc + p.netAmount : acc), 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalRevenue,
      totalNetRevenue,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / View Invoice PDF
// @route   GET /api/v1/payments/:id/invoice
// @access  Public
exports.getInvoicePDF = async (req, res, next) => {
  try {
    let payment = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      payment = await Payment.findById(req.params.id);
      if (!payment) {
        payment = await Payment.findOne({ sessionId: req.params.id });
      }
    }
    if (!payment) {
      payment = await Payment.findOne({ invoiceNumber: req.params.id });
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const therapist = await Therapist.findById(payment.therapistId);

    // Always generate fresh authentic PDF invoice with executive typography and clean layout
    const generated = await invoiceService.generateInvoicePDF(payment, therapist);
    const filePath = generated.filePath;
    payment.invoiceUrl = generated.relativeUrl;
    await payment.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${payment.invoiceNumber}.pdf"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get packages for a therapist by slug
// @route   GET /api/v1/payments/packages/:slug
// @access  Public
exports.getPackagesBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    let packages = await Package.find({ therapistId: therapist._id, isActive: true });
    
    // Seed default packages if none exist for this therapist
    if (packages.length === 0) {
      const fee = therapist.consultationFee || 1800;
      packages = await Package.insertMany([
        {
          therapistId: therapist._id,
          title: 'Foundation Care (3 Sessions)',
          sessionCount: 3,
          price: Math.round(fee * 3 * 0.92), // 8% off
          discountPercentage: 8,
          validityDays: 60,
          description: 'Ideal for short-term goal-focused coping strategies, stress relief, and actionable habit shifts.',
        },
        {
          therapistId: therapist._id,
          title: 'Transformation Journey (6 Sessions)',
          sessionCount: 6,
          price: Math.round(fee * 6 * 0.85), // 15% off
          discountPercentage: 15,
          validityDays: 120,
          description: 'Our most popular package for addressing anxiety, self-worth, deep-rooted patterns, and relationship challenges.',
        },
        {
          therapistId: therapist._id,
          title: 'Comprehensive Therapy (12 Sessions)',
          sessionCount: 12,
          price: Math.round(fee * 12 * 0.80), // 20% off
          discountPercentage: 20,
          validityDays: 240,
          description: 'In-depth long-term psychotherapy for trauma processing, personality growth, and sustained mental wellness.',
        },
      ]);
    }

    res.status(200).json({
      success: true,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new package
// @route   POST /api/v1/payments/packages
// @access  Private (Therapist)
exports.createPackage = async (req, res, next) => {
  try {
    const { title, sessionCount, price, discountPercentage, validityDays, description } = req.body;

    const pkg = await Package.create({
      therapistId: req.therapist._id,
      title,
      sessionCount,
      price,
      discountPercentage: discountPercentage || 10,
      validityDays: validityDays || 90,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully.',
      package: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record manual / offline payment (Cash, Direct Bank Transfer, Offline UPI)
// @route   POST /api/v1/payments/record-manual
// @access  Private (Therapist)
exports.recordManualPayment = async (req, res, next) => {
  try {
    const { clientId, clientName, clientEmail, amount, paymentMethod = 'cash', description, sessionId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    const parsedAmount = Number(amount);
    const invoiceNumber = `TL-INV-${Date.now().toString().slice(-6)}`;
    const taxAmount = Math.round(parsedAmount * 0.18);

    const payment = await Payment.create({
      therapistId: req.therapist._id,
      clientId: clientId || null,
      clientName: clientName || 'Client',
      clientEmail: (clientEmail || '').toLowerCase(),
      sessionId: sessionId || null,
      amount: parsedAmount,
      amountInPaise: Math.round(parsedAmount * 100),
      currency: 'INR',
      status: 'captured',
      paymentMethod,
      invoiceNumber,
      taxAmount,
      platformFee: 0,
      netAmount: parsedAmount,
      razorpayOrderId: `manual_${Date.now()}`,
      razorpayPaymentId: `manual_pay_${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Manual payment recorded and GST invoice generated.',
      payment,
    });
  } catch (error) {
    next(error);
  }
};
