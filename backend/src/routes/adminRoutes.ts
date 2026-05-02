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
  getTopSellingProducts,
  getTotalRevenue,
  updateOrderStatus,
  getAllGiftCards,
  createGiftCard,
} from "../controllers/adminController";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", updateProduct);
router.get("/orders", getAdminOrders);
router.get("/top-products", getTopSellingProducts);
router.get("/settings", getAdminSettings);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id/toggle", toggleProductAvailability);
router.get("/revenue", getTotalRevenue);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/gift-cards", getAllGiftCards);
router.post("/gift-cards", createGiftCard);

export default router;
