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
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
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
router.get("/cart", requireClerkAuth, fetchCart);
router.post("/cart", requireClerkAuth, addToCart);
router.patch("/cart", requireClerkAuth, updateCartItem);
router.delete("/cart", requireClerkAuth, removeFromCart);
router.get("/:id", getUserById);
router.put("/:id", requireClerkAuth, updateUser);
router.delete("/:id", deleteUser);
router.delete("/cart/clear", requireClerkAuth, clearCart);

export default router;
