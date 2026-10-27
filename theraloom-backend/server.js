const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const initChatSocket = require('./src/sockets/chatSocket');
const autoProvision = require('./src/utils/autoProvision');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow localhost, FRONTEND_URL, or any *.vercel.app domain
      if (!origin || origin.includes('localhost') || origin.endsWith('.vercel.app') || (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initChatSocket(io);

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  await autoProvision();
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌿 Theraloom Backend API running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`💬 Real-Time Chat & Sockets initialized`);
    console.log(`====================================================`);
  });
};

startServer();

module.exports = { server, app };
