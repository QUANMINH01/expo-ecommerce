import { User } from "../models/user.model.js";
import { isAdminEmail, normalizeEmail } from "../utils/admin.js";

export async function syncUser(req, res) {
  try {
    const clerkId = req.clerkId;
    const { email, name, imageUrl } = req.body;

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const nextRole = isAdminEmail(normalizedEmail) ? "admin" : "customer";

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = await User.create({
        clerkId,
        email: normalizedEmail,
        name: name || "User",
        imageUrl: imageUrl || "",
        role: nextRole,
        addresses: [],
        wishlist: [],
      });
    } else {
      user.email = normalizedEmail;
      user.name = name || user.name;
      user.imageUrl = imageUrl || user.imageUrl;
      user.role = nextRole;
      await user.save();
    }

    res.status(200).json({
      message: "User synced successfully",
      user,
    });
  } catch (error) {
    console.error("Error in syncUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProfile(req, res) {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    const user = req.user;

    if (!fullName || !streetAddress || !city || !state || !zipCode) {
      return res.status(400).json({ error: "Missing required address fields" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in addAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAddresses(req, res) {
  try {
    const user = req.user;
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error in getAddresses controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    const { addressId } = req.params;
    const user = req.user;
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in updateAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = req.user;

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in deleteAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in addToWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;

    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product not found in wishlist" });
    }

    user.wishlist.pull(productId);
    await user.save();

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in removeFromWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
