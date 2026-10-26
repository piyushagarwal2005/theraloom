const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

let transporter = null;

try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    auth: {
      user: process.env.EMAIL_USER || 'demo@ethereal.email',
      pass: process.env.EMAIL_PASS || 'demopassword',
    },
  });
} catch (err) {
  console.warn('[Nodemailer] Warning: transporter setup deferred:', err.message);
}

/**
 * Sends or simulates an email
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (transporter && process.env.EMAIL_USER && process.env.EMAIL_USER !== 'demo@ethereal.email') {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Theraloom Practice" <notifications@theraloom.in>',
        to,
        subject,
        html,
      });
      console.log(`[Email Sent] Message sent to ${to}: ${info.messageId}`);
      return info;
    } else {
      console.log(`[Email Simulator] To: ${to} | Subject: "${subject}" | Status: Delivered (Ethereal/Dev Mode)`);
      return { simulated: true, to, subject };
    }
  } catch (error) {
    console.warn(`[Email Delivery Warning] Could not deliver to ${to}: ${error.message}`);
  }
};

/**
 * WhatsApp Business API stub
 * Stubs WhatsApp Cloud API template payload and records to notification collection
 */
const sendWhatsAppStub = async ({ toPhone, templateName, components }) => {
  const payload = {
    messaging_product: 'whatsapp',
    to: toPhone || '+919876543210',
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en_IN' },
      components: components || [],
    },
  };

  console.log(`[WhatsApp Business API Stub] Sending WhatsApp Template "${templateName}" to ${toPhone || '+91-XXXXXXXXXX'}:`, JSON.stringify(payload, null, 2));
  return { status: 'queued_in_stub', payload };
};

/**
 * Triggered when a session is booked
 */
const notifyBookingConfirmed = async (session) => {
  const dateFormatted = new Date(session.startTime).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(session.startTime));

  // 1. Notify Therapist
  await Notification.create({
    recipientType: 'therapist',
    recipientId: session.therapistId,
    type: 'booking_confirmed',
    title: 'New Session Booked',
    message: `${session.clientName} booked ${session.serviceName} for ${dateFormatted} at ${timeFormatted} IST.`,
    channel: 'in_app',
    metadata: { sessionId: session._id, clientEmail: session.clientEmail },
  });

  // 2. Client In-App / WhatsApp Notification
  if (session.clientId) {
    await Notification.create({
      recipientType: 'client',
      recipientId: session.clientId,
      type: 'booking_confirmed',
      title: 'Appointment Confirmed',
      message: `Your session is confirmed for ${dateFormatted} at ${timeFormatted} IST. Meeting link: ${session.meetingLink}`,
      channel: 'whatsapp_stub',
      metadata: { sessionId: session._id },
    });
  }

  // 3. Stubbed WhatsApp
  await sendWhatsAppStub({
    toPhone: session.clientPhone,
    templateName: 'theraloom_appointment_confirmation',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: session.clientName },
          { type: 'text', text: dateFormatted },
          { type: 'text', text: timeFormatted },
          { type: 'text', text: session.meetingLink },
        ],
      },
    ],
  });

  // 4. Email Notification to Client
  await sendEmail({
    to: session.clientEmail,
    subject: `Confirmed: Therapy Session on ${dateFormatted}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #EAE5DE; border-radius: 8px;">
        <h2 style="color: #19382C;">Theraloom Appointment Confirmation</h2>
        <p>Dear ${session.clientName},</p>
        <p>Your psychotherapy session has been successfully booked and confirmed.</p>
        <div style="background-color: #F4EFEB; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Date:</strong> ${dateFormatted}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${timeFormatted} (IST)</p>
          <p style="margin: 4px 0;"><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
          <p style="margin: 4px 0;"><strong>Secure Video Room:</strong> <a href="${session.meetingLink}" style="color: #19382C;">Join Session</a></p>
        </div>
        <p style="color: #535C56; font-size: 13px;">If you need to reschedule or have questions, please reach out via your client portal.</p>
      </div>
    `,
  });
};

/**
 * Triggered on verified payment success
 */
const notifyPaymentSuccess = async (payment) => {
  // Therapist notification
  await Notification.create({
    recipientType: 'therapist',
    recipientId: payment.therapistId,
    type: 'payment_success',
    title: 'Payment Received',
    message: `Received ₹${payment.amount} from ${payment.clientName} (${payment.paymentMethod.toUpperCase()}).`,
    channel: 'in_app',
    metadata: { paymentId: payment._id, amount: payment.amount },
  });

  // WhatsApp stub
  await sendWhatsAppStub({
    toPhone: '',
    templateName: 'theraloom_payment_receipt',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: payment.clientName },
          { type: 'text', text: `₹${payment.amount}` },
          { type: 'text', text: payment.invoiceNumber || 'Invoice' },
        ],
      },
    ],
  });
};

/**
 * Triggered when a note is explicitly shared with a client
 */
const notifySharedNote = async (client, note) => {
  await Notification.create({
    recipientType: 'client',
    recipientId: client._id,
    type: 'shared_note',
    title: 'New Note Shared by Your Therapist',
    message: `Your therapist shared resources/notes from your recent session: "${note.title}".`,
    channel: 'in_app',
    metadata: { noteId: note._id },
  });
};

module.exports = {
  notifyBookingConfirmed,
  notifyPaymentSuccess,
  notifySharedNote,
  sendWhatsAppStub,
  sendEmail,
};
