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
} from "../controllers/userController";
import { requireClerkAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/sync", requireClerkAuth, syncUser);
router.put("/profile", requireClerkAuth, updateProfile);
router.get("/me", requireClerkAuth, getCurrentUser);
router.get("/:id", getUserById);
router.put("/:id", requireClerkAuth, updateUser);
router.delete("/:id", deleteUser);
router.post("/order", requireClerkAuth, orderProduct);
router.post("/wishlist", requireClerkAuth, addToWishList);
router.delete("/wishlist", requireClerkAuth, removeFromWishList);

export default router;
