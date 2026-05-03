import { create } from "zustand";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

export type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  };
};

export type ReviewStats = {
  averageRating: number;
  totalReviews: number;
};

type GetProductReviewsResponse =
  | {
      success: true;
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      stats: ReviewStats;
    }
  | { success?: false; error?: string };

type CreateReviewResponse =
  | { success: true; review: Review }
  | { success?: false; error?: string };

type UpdateReviewResponse =
  | { success: true; review: Review }
  | { success?: false; error?: string };

type DeleteReviewResponse =
  | { success: true; message: string }
  | { success?: false; error?: string };

interface ReviewState {
  reviews: Review[];
  stats: ReviewStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProductReviews: (
    productId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  createReview: (
    productId: string,
    reviewData: {
      rating: number;
      title?: string;
      comment: string;
    },
    token: string,
  ) => Promise<Review | null>;
  updateReview: (
    reviewId: string,
    reviewData: {
      rating: number;
      title?: string;
      comment: string;
    },
    token: string,
  ) => Promise<Review | null>;
  deleteReview: (reviewId: string, token: string) => Promise<boolean>;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  reviews: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,

  reset: () =>
    set({
      reviews: [],
      stats: null,
      pagination: null,
      isLoading: false,
      error: null,
    }),

  fetchProductReviews: async (productId, page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });

      const res = await api.get<GetProductReviewsResponse>(
        `/api/reviews/product/${productId}?page=${page}&limit=${limit}`,
      );

      if ("success" in res.data && res.data.success === true) {
        set({
          reviews: res.data.reviews,
          stats: res.data.stats,
          pagination: res.data.pagination,
          isLoading: false,
        });
        return;
      }

      set({
        reviews: [],
        stats: null,
        pagination: null,
        isLoading: false,
        error:
          ("error" in res.data && res.data.error) || "Failed to fetch reviews",
      });
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error || error.message
          : "Failed to fetch reviews";

      set({
        reviews: [],
        stats: null,
        pagination: null,
        isLoading: false,
        error: message,
      });
    }
  },

  createReview: async (productId, reviewData, token) => {
    try {
      set({ isLoading: true, error: null });

      const res = await api.post<CreateReviewResponse>(
        `/api/reviews/product/${productId}`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if ("success" in res.data && res.data.success === true) {
        // Refresh reviews after creating
        await get().fetchProductReviews(productId);
        set({ isLoading: false });
        return res.data.review;
      }

      set({
        isLoading: false,
        error:
          ("error" in res.data && res.data.error) || "Failed to create review",
      });
      return null;
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error || error.message
          : "Failed to create review";

      set({ isLoading: false, error: message });
      return null;
    }
  },

  updateReview: async (reviewId, reviewData, token) => {
    try {
      set({ isLoading: true, error: null });

      const res = await api.put<UpdateReviewResponse>(
        `/api/reviews/${reviewId}`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if ("success" in res.data && res.data.success === true) {
        // Update the review in the local state
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === reviewId ? res.data.review : review,
          ),
          isLoading: false,
        }));
        return res.data.review;
      }

      set({
        isLoading: false,
        error:
          ("error" in res.data && res.data.error) || "Failed to update review",
      });
      return null;
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error || error.message
          : "Failed to update review";

      set({ isLoading: false, error: message });
      return null;
    }
  },

  deleteReview: async (reviewId, token) => {
    try {
      set({ isLoading: true, error: null });

      const res = await api.delete<DeleteReviewResponse>(
        `/api/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if ("success" in res.data && res.data.success === true) {
        // Remove the review from local state
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== reviewId),
          stats: state.stats
            ? {
                ...state.stats,
                totalReviews: state.stats.totalReviews - 1,
              }
            : null,
          pagination: state.pagination
            ? {
                ...state.pagination,
                total: state.pagination.total - 1,
              }
            : null,
          isLoading: false,
        }));
        return true;
      }

      set({
        isLoading: false,
        error:
          ("error" in res.data && res.data.error) || "Failed to delete review",
      });
      return false;
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error || error.message
          : "Failed to delete review";

      set({ isLoading: false, error: message });
      return false;
    }
  },
}));
