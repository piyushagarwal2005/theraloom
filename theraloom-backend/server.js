const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const initChatSocket = require('./src/sockets/chatSocket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initChatSocket(io);

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
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
