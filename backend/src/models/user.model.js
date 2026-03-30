import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: "User",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      index: true,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
