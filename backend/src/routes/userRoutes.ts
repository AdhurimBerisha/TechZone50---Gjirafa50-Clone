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
  createStripeCheckoutSession,
  completeStripeCheckout,
  createGiftCardStripeCheckoutSession,
  completeGiftCardStripeCheckout,
  addToWishList,
  removeFromWishList,
  fetchWishlist,
  fetchOrders,
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  orderGiftCard,
  uploadAvatar,
} from "../controllers/userController";
import { requireClerkAuth } from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";

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
router.post(
  "/order/stripe/create-session",
  requireClerkAuth,
  createStripeCheckoutSession,
);
router.post("/order/stripe/complete", requireClerkAuth, completeStripeCheckout);
router.get("/cart", requireClerkAuth, fetchCart);
router.post("/cart", requireClerkAuth, addToCart);
router.patch("/cart", requireClerkAuth, updateCartItem);
router.delete("/cart", requireClerkAuth, removeFromCart);
router.put("/me", requireClerkAuth, updateUser);
router.delete("/me", requireClerkAuth, deleteUser);
router.delete("/cart/clear", requireClerkAuth, clearCart);
router.get("/:id", getUserById);
router.post(
  "/gift-card/stripe/create-session",
  requireClerkAuth,
  createGiftCardStripeCheckoutSession,
);
router.post(
  "/gift-card/stripe/complete",
  requireClerkAuth,
  completeGiftCardStripeCheckout,
);
router.post("/gift-card/order", requireClerkAuth, orderGiftCard);
router.post("/upload-avatar", upload.single("avatar"), uploadAvatar);

export default router;
