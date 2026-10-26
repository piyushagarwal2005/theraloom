const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;

  // 1. If explicit Atlas or custom MONGO_URI provided (not default localhost)
  if (mongoUri && !mongoUri.includes('127.0.0.1:27017') && !mongoUri.includes('localhost:27017')) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        driverInfo: { name: 'theraloom', version: '1.0.0' },
      });
      console.log(`[Database] Connected to external MongoDB at: ${mongoUri.replace(/:[^:]*@/, ':****@')}`);
      return;
    } catch (err) {
      console.warn(`[Database] Failed connecting to provided MONGO_URI (${err.message}). Trying fallback.`);
    }
  }

  // 2. Try standard local MongoDB if running
  try {
    const localUri = mongoUri || 'mongodb://127.0.0.1:27017/theraloom';
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
      driverInfo: { name: 'theraloom', version: '1.0.0' },
    });
    console.log(`[Database] Connected to local MongoDB at: ${localUri}`);
    return;
  } catch (localErr) {
    // Local daemon not active, fall back seamlessly to MongoMemoryServer
  }

  // 3. Fallback to MongoMemoryServer (zero external setup required)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongodInstance) {
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'theraloom',
        },
      });
    }
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri, {
      driverInfo: { name: 'theraloom', version: '1.0.0' },
    });
    console.log(`[Database] Connected to In-Memory MongoDB Server at: ${memoryUri}`);
  } catch (err) {
    console.error(`[Database Error] Connection failed: ${err.message}`);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (err) {
    console.error('[Database Disconnect Error]', err);
  }
};

module.exports = { connectDB, disconnectDB };

