import mongoose from "mongoose";
import dns from "dns";

// Use Google DNS to resolve Atlas hostname (system DNS blocks external lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Missing MongoDB connection string. Set MONGODB_URI in backend/.env.");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Stop the app if DB connection fails
  }
};

export default connectDB;