import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,          // Force IPv4 — fixes DNS issues on some networks
      retryWrites: true,
    };

    await mongoose.connect(process.env.MONGODB_URI, opts);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    isConnected = false;
    console.error("❌ MongoDB connection error:", err.message);
    throw new Error("Database connection failed: " + err.message);
  }
}
