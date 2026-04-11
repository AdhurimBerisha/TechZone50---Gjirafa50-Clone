import { Router } from "express";
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminProducts,
  getAdminOrders,
  getAdminSettings,
} from "../controllers/adminController";

const router = Router();

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAdminUsers);
router.get("/products", getAdminProducts);
router.get("/orders", getAdminOrders);
router.get("/settings", getAdminSettings);

export default router;
