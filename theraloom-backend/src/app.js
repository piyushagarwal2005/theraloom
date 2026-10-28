const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const clientRoutes = require('./routes/clientRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const tierRoutes = require('./routes/tierRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/staging
      }
    },
    credentials: true,
  })
);

// Capture raw body for webhook verification alongside json parsing
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (avatars, invoices)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Root status & welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌿 Theraloom Backend API is running successfully on Render!',
    version: '1.0.0',
    status: 'healthy',
    endpoints: {
      health: '/api/v1/health',
      directory: '/api/v1/therapists/public',
      tiers: '/api/v1/tiers',
    },
    timestamp: new Date().toISOString(),
  });
});

// API v1 base status & discovery endpoint
app.get(['/api/v1', '/api/v1/'], (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌿 Theraloom API v1 is active and ready to receive requests.',
    status: 'healthy',
    version: '1.0.0',
    availableRoutes: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      therapists: '/api/v1/therapists/public',
      scheduling: '/api/v1/scheduling',
      tiers: '/api/v1/tiers',
      clients: '/api/v1/clients',
      payments: '/api/v1/payments',
      notes: '/api/v1/notes',
      chat: '/api/v1/chat',
      analytics: '/api/v1/analytics',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'Theraloom API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/therapists', therapistRoutes);
app.use('/api/v1/scheduling', schedulingRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/tiers', tierRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
