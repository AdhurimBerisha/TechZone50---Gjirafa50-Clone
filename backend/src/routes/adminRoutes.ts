import { Router } from "express";
import {
  getAdminDashboard,
  getAllUsers,
  getAllProducts,
  getAdminOrders,
  getAdminSettings,
  createProduct,
} from "../controllers/adminController";

const router = Router();

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.post("/products", createProduct);
router.get("/orders", getAdminOrders);
router.get("/settings", getAdminSettings);

export default router;
