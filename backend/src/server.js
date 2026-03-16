import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

import { functions, inngest } from "./config/inngest.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

import adminRoutes from "./routes/admin.route.js";

const app = express();

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true });
});

const port = Number(ENV.PORT) || 10000;

const startServer = async () => {
  await connectDB();

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is up and running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
