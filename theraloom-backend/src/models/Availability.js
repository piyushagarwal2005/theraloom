const mongoose = require('mongoose');

const timeWindowSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "13:00"
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    max: 6,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  timeSlots: [timeWindowSchema],
}, { _id: false });

const overrideSchema = new mongoose.Schema({
  date: {
    type: String, // "YYYY-MM-DD"
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  timeSlots: [timeWindowSchema],
}, { _id: false });

const availabilitySchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      unique: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    slotDuration: {
      type: Number,
      enum: [30, 45, 50, 60, 75, 90],
      default: 50,
    },
    bufferTimeMinutes: {
      type: Number,
      default: 10,
    },
    advanceBookingDays: {
      type: Number,
      default: 30, // Can book up to 30 days ahead
    },
    minNoticeHours: {
      type: Number,
      default: 2, // Minimum 2 hours notice
    },
    weeklySchedule: {
      type: [dayScheduleSchema],
      default: [
        { dayOfWeek: 1, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 2, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 3, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 4, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 5, isAvailable: true, timeSlots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 6, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 0, isAvailable: false, timeSlots: [] },
      ],
    },
    overrides: [overrideSchema],
    blockedDates: [{ type: String }], // Array of "YYYY-MM-DD"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
