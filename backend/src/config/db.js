import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    if (!ENV.DB_URL) {
      throw new Error("Missing DB_URL in environment variables");
    }

    const conn = await mongoose.connect(ENV.DB_URL.trim());
    console.log(`✅ Connected to MONGODB: ${conn.connection.host}`);
  } catch (error) {
    console.error("💥 MONGODB connection error:", error.message);
    console.error(error);
    process.exit(1);
  }
};
