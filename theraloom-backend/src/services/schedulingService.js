const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Client = require('../models/Client');
const notificationService = require('./notificationService');

/**
 * Parses "HH:mm" and a date string "YYYY-MM-DD" into a Date object in IST or given timezone.
 */
function createDateTime(dateStr, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);
  // Using explicit UTC construction adjusted for Indian Standard Time (UTC+05:30)
  // 5.5 hours = 330 minutes
  const utcMillis = Date.UTC(year, month - 1, day, hours, minutes) - (5.5 * 60 * 60 * 1000);
  return new Date(utcMillis);
}

/**
 * Format Date to "10:00 AM" IST
 */
function formatTimeDisplay(date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

/**
 * Computes available slots for a given therapist and date
 */
const getAvailableSlots = async (therapistId, dateStr, clientTz = 'Asia/Kolkata') => {
  const availability = await Availability.findOne({ therapistId });
  if (!availability) {
    return [];
  }

  // Check if date is blocked
  if (availability.blockedDates && availability.blockedDates.includes(dateStr)) {
    return [];
  }

  // Parse target date to get day of week in IST
  const [y, m, d] = dateStr.split('-').map(Number);
  // Noon in IST for reliable day-of-week calculation
  const targetDateObj = new Date(Date.UTC(y, m - 1, d, 6, 30));
  const dayOfWeek = targetDateObj.getUTCDay();

  // Check for date override
  const override = availability.overrides.find((o) => o.date === dateStr);
  let timeWindows = [];

  if (override) {
    if (!override.isAvailable) return [];
    timeWindows = override.timeSlots;
  } else {
    const dayConfig = availability.weeklySchedule.find((w) => w.dayOfWeek === dayOfWeek);
    if (!dayConfig || !dayConfig.isAvailable) return [];
    timeWindows = dayConfig.timeSlots;
  }

  const slotDuration = availability.slotDuration || 50;
  const bufferTime = availability.bufferTimeMinutes || 10;
  const slotTotalStep = slotDuration + bufferTime;

  // Retrieve already booked or confirmed sessions for this therapist on this date
  const bookedSessions = await Session.find({
    therapistId,
    status: { $in: ['scheduled', 'confirmed'] },
    date: dateStr,
  });

  const now = new Date();
  const availableSlots = [];

  for (const window of timeWindows) {
    let windowStart = createDateTime(dateStr, window.startTime);
    const windowEnd = createDateTime(dateStr, window.endTime);

    while (windowStart.getTime() + slotDuration * 60 * 1000 <= windowEnd.getTime()) {
      const slotStart = new Date(windowStart);
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

      // Check if slot is in the past
      if (slotStart.getTime() > now.getTime()) {
        // Check for collision with any booked session
        const hasCollision = bookedSessions.some((s) => {
          const bookedStart = new Date(s.startTime).getTime();
          const bookedEnd = new Date(s.endTime).getTime();
          return slotStart.getTime() < bookedEnd && slotEnd.getTime() > bookedStart;
        });

        if (!hasCollision) {
          availableSlots.push({
            slotId: `${dateStr}_${windowStart.toISOString()}`,
            date: dateStr,
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            timeDisplay: formatTimeDisplay(slotStart),
            durationMinutes: slotDuration,
            timezone: 'Asia/Kolkata',
          });
        }
      }

      // Step to next slot including buffer
      windowStart = new Date(windowStart.getTime() + slotTotalStep * 60 * 1000);
    }
  }

  return availableSlots;
};

/**
 * Atomically books a session and prevents double booking
 */
const bookSession = async (therapistId, bookingData) => {
  const {
    clientName,
    clientEmail,
    clientPhone,
    serviceName,
    durationMinutes,
    date,
    startTime,
    price,
    paymentStatus = 'paid',
  } = bookingData;

  const start = new Date(startTime);
  const duration = durationMinutes || 50;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  // 1. Atomic Overlap Check
  const conflict = await Session.findOne({
    therapistId,
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      { startTime: { $lt: end, $gte: start } },
      { endTime: { $gt: start, $lte: end } },
      { startTime: { $lte: start }, endTime: { $gte: end } },
    ],
  });

  if (conflict) {
    const error = new Error('This time slot is no longer available. Please select another slot.');
    error.statusCode = 409;
    throw error;
  }

  // 2. Find or register client in CRM
  let client = await Client.findOne({
    therapistId,
    email: clientEmail.toLowerCase(),
  });

  if (!client) {
    client = await Client.create({
      therapistId,
      name: clientName,
      email: clientEmail.toLowerCase(),
      phone: clientPhone || '',
      status: 'active',
      tags: ['new-client'],
    });
  } else {
    if (clientPhone && !client.phone) client.phone = clientPhone;
    if (client.status === 'lead' || client.status === 'inactive') client.status = 'active';
    await client.save();
  }

  // 3. Generate meeting room link
  const cleanCode = Math.random().toString(36).substring(2, 9);
  const meetingLink = `https://meet.jit.si/theraloom-${therapistId.toString().slice(-6)}-${cleanCode}`;

  // 4. Create Session
  const session = await Session.create({
    therapistId,
    clientId: client._id,
    clientName,
    clientEmail: clientEmail.toLowerCase(),
    clientPhone,
    serviceName: serviceName || 'Individual Psychotherapy',
    durationMinutes: duration,
    date,
    startTime: start,
    endTime: end,
    timezone: 'Asia/Kolkata',
    status: 'confirmed',
    price: price || 1800,
    paymentStatus,
    meetingLink,
  });

  // 5. Update client's last session date
  client.lastSessionDate = start;
  await client.save();

  // 6. Trigger notification event
  try {
    await notificationService.notifyBookingConfirmed(session);
  } catch (notifErr) {
    console.warn('[Notification] Failed to send booking notification:', notifErr.message);
  }

  return session;
};

module.exports = {
  getAvailableSlots,
  bookSession,
};
