const express = require('express');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  submitIntake,
  submitConsent,
} = require('../controllers/clientController');
const { protectTherapist } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for clients during booking/onboarding
router.post('/intake', submitIntake);
router.post('/consent', submitConsent);

// Protected routes for therapist CRM
router.get('/', protectTherapist, getClients);
router.get('/:id', protectTherapist, getClientById);
router.post('/', protectTherapist, createClient);
router.put('/:id', protectTherapist, updateClient);

module.exports = router;
