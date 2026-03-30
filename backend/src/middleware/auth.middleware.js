import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const verifyClerkToken = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const auth = req.auth();
      const clerkId = auth.userId;

      if (!clerkId) {
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });
      }

      req.clerkId = clerkId;
      next();
    } catch (error) {
      console.error("Error in verifyClerkToken:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const auth = req.auth();
      const clerkId = auth.userId;

      if (!clerkId) {
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });
      }

      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(404).json({ message: "User not found in database" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    const userEmail = req.user.email?.trim().toLowerCase();
    const adminEmail = ENV.ADMIN_EMAIL?.trim().toLowerCase();

    console.log("req.user.email =", userEmail);
    console.log("ENV.ADMIN_EMAIL =", adminEmail);

    if (userEmail !== adminEmail) {
      return res.status(403).json({
        message: "Forbidden - admin access only",
        debug: {
          userEmail,
          adminEmail,
        },
      });
    }

    next();
  } catch (error) {
    console.error("Error in adminOnly middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
