import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log(`Connect to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:");
    process.exit(1); // Exit code 1 failure, 0 mean success
  }
};
