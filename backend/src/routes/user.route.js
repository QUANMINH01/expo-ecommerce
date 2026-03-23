import { Router } from "express";
import {
  addAddress,
  addToWishlist,
  deleteAddress,
  getAddresses,
  getProfile,
  getWishlist,
  removeFromWishlist,
  syncUser,
  updateAddress,
} from "../controllers/user.controller.js";
import {
  protectRoute,
  verifyClerkToken,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/sync", verifyClerkToken, syncUser);

router.use(protectRoute);

router.get("/profile", getProfile);

router.post("/addresses", addAddress);
router.get("/addresses", getAddresses);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);
router.get("/wishlist", getWishlist);

export default router;
