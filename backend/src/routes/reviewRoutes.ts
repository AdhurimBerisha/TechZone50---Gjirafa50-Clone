import { Router } from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  moderateReview,
} from "../controllers/reviewController";
import { requireClerkAuth } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes (require authentication)
router.post("/product/:productId", requireClerkAuth, createReview);
router.put("/:reviewId", requireClerkAuth, updateReview);
router.delete("/:reviewId", requireClerkAuth, deleteReview);

// Admin routes
router.get("/admin/all", requireClerkAuth, getAllReviews);
router.post("/admin/:reviewId/moderate", requireClerkAuth, moderateReview);

export default router;
