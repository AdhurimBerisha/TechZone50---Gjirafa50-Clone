import { Router } from "express";
import {
  syncUser,
  updateProfile,
  updateUser,
  deleteUser,
  getUserById,
  getCurrentUser,
  orderProduct,
  addToWishList,
  removeFromWishList,
  fetchWishlist,
  fetchOrders,
} from "../controllers/userController";
import { requireClerkAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/sync", requireClerkAuth, syncUser);
router.put("/profile", requireClerkAuth, updateProfile);
router.get("/me", requireClerkAuth, getCurrentUser);
router.get("/orders", requireClerkAuth, fetchOrders);
router.get("/wishlist", requireClerkAuth, fetchWishlist);
router.post("/wishlist", requireClerkAuth, addToWishList);
router.delete("/wishlist", requireClerkAuth, removeFromWishList);
router.post("/order", requireClerkAuth, orderProduct);
router.get("/:id", getUserById);
router.put("/:id", requireClerkAuth, updateUser);
router.delete("/:id", deleteUser);

export default router;
