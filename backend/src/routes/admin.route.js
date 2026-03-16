import { Router } from "express";
import {
  createProduct,
  getAllCustomers,
  getAllProducts,
  getDashboardStats,
  updateOrderStatus,
  updateProduct,
} from "../controllers/admin.controller.js";
import { adminOnly, protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { get } from "mongoose";

const router = Router();

router.use(protectRoute, adminOnly);

router.post("/products", upload.array("images", 3), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images", 3), updateProduct);

router.get("/orders", getAllProducts);
router.patch("/orders/:orderId/status", updateOrderStatus);

router.get("/customers", getAllCustomers);

router.get("/stats", getDashboardStats);

export default router;
