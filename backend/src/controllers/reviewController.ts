import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getClerkUserId } from "../middleware/authMiddleware";

const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    // Calculate average rating
    const ratingStats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: ratingStats._avg?.rating || 0,
        totalReviews: ratingStats._count?.rating || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

const createReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const clerkUserId = getClerkUserId(req);
    if (!clerkUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    // Check if user has purchased this product (for verified reviews)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          status: { not: "CANCELLED" },
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        title: title?.trim() || null,
        comment: comment.trim(),
        isVerified: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update product rating
    await updateProductRating(productId);

    return res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ error: "Failed to create review" });
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    if (!reviewId || typeof reviewId !== "string") {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const clerkUserId = getClerkUserId(req);
    if (!clerkUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find and update review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId !== user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own reviews" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        title: title?.trim() || null,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update product rating
    await updateProductRating(review.productId);

    return res.status(200).json({ success: true, review: updatedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({ error: "Failed to update review" });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId || typeof reviewId !== "string") {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const clerkUserId = getClerkUserId(req);
    if (!clerkUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user owns the review or is admin
    if (review.userId !== user.id && user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "You can only delete your own reviews" });
    }

    const productId = review.productId;

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update product rating
    await updateProductRating(productId);

    return res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ error: "Failed to delete review" });
  }
};

// Admin functions
const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count(),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

const moderateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { action } = req.body; // 'approve', 'hide', 'delete'

    if (!reviewId || typeof reviewId !== "string") {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    if (!["approve", "hide", "delete"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (action === "delete") {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (review) {
        const productId = review.productId;
        await prisma.review.delete({ where: { id: reviewId } });
        await updateProductRating(productId);
      }
    } else {
      // For now, we'll just handle delete. Could add moderation fields later
      return res.status(400).json({ error: "Action not implemented yet" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Review moderated successfully" });
  } catch (error) {
    console.error("Error moderating review:", error);
    return res.status(500).json({ error: "Failed to moderate review" });
  }
};

// Helper function to update product rating
async function updateProductRating(productId: string) {
  const ratingStats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: ratingStats._avg.rating || 0,
      // Note: You might want to add a reviewCount field to Product model
    },
  });
}

export {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  moderateReview,
};
