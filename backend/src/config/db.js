import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(ENV.DB_URL);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
