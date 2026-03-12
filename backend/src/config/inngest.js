import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";

export const inngest = new Inngest({ id: "ecommerce-backend" });

const getPrimaryEmail = (user) =>
  user.email_addresses?.find(
    (email) => email.id === user.primary_email_address_id,
  )?.email_address || "";

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const user = event.data;
    const email = getPrimaryEmail(user);

    await User.create({
      clerkId: user.id,
      email,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User",
      imageUrl: user.image_url,
      addresses: [],
      wishlist: [],
    });
  },
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const user = event.data;
    await User.deleteOne({ clerkId: user.id });
  },
);

export const functions = [syncUser, deleteUserFromDB];
