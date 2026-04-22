import { Router } from "express";
import {
  getAdminDashboard,
  getAllUsers,
  getAllProducts,
  getAdminOrders,
  getAdminSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  getAllOrders,
} from "../controllers/adminController";

const router = Router();

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.get("/orders", getAdminOrders);
router.get("/settings", getAdminSettings);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id/toggle", toggleProductAvailability);
router.get("/orders", getAllOrders);

export default router;
