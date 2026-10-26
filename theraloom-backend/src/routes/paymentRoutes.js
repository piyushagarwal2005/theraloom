const express = require('express');
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getTherapistPayments,
  getInvoicePDF,
  getPackagesBySlug,
  createPackage,
  recordManualPayment,
} = require('../controllers/paymentController');
const { protectTherapist } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for payment checkout and client invoices
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/:id/invoice', getInvoicePDF);
router.get('/packages/:slug', getPackagesBySlug);

// Protected routes (Therapist)
router.get('/', protectTherapist, getTherapistPayments);
router.post('/packages', protectTherapist, createPackage);
router.post('/record-manual', protectTherapist, recordManualPayment);

module.exports = router;
