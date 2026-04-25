import { Router } from "express";
import {
  syncUser,
  updateProfile,
  updateUser,
  deleteUser,
  getUserById,
  getCurrentUser,
  orderProduct,
  checkoutCart,
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
router.post("/order/checkout", requireClerkAuth, checkoutCart);
router.get("/cart", requireClerkAuth, fetchCart);
router.post("/cart", requireClerkAuth, addToCart);
router.patch("/cart", requireClerkAuth, updateCartItem);
router.delete("/cart", requireClerkAuth, removeFromCart);
router.put("/me", requireClerkAuth, updateUser);
router.delete("/me", requireClerkAuth, deleteUser);
router.delete("/cart/clear", requireClerkAuth, clearCart);
router.get("/:id", getUserById);

export default router;
