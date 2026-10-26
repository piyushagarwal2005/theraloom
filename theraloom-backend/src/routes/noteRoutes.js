const express = require('express');
const {
  getAllNotes,
  getTherapistNotes,
  getClientSharedNotes,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const { protectTherapist } = require('../middleware/authMiddleware');

const router = express.Router();

// Client-facing endpoint: strictly returns SHARED notes only
router.get('/shared/:clientId', getClientSharedNotes);

// Therapist-only clinical documentation routes
router.get('/', protectTherapist, getAllNotes);
router.get('/client/:clientId', protectTherapist, getTherapistNotes);
router.post('/', protectTherapist, createNote);
router.put('/:id', protectTherapist, updateNote);
router.delete('/:id', protectTherapist, deleteNote);

module.exports = router;
