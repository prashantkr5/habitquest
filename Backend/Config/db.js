const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,                    // Force IPv4
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,              // up from default 5 → handles 50 simultaneous DB ops
      minPoolSize: 5,               // keep 5 connections warm at all times
      socketTimeoutMS: 30000,       // drop idle sockets after 30s
      bufferCommands: false,        // fail fast if DB is down (don't queue indefinitely)
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;