import type { Request, Response } from "express";
import { OrderStatus, type Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { getClerkUserId } from "../middleware/authMiddleware";

const syncUser = async (req: Request, res: Response) => {
  const clerkId = getClerkUserId(req);
  const { email, name } = req.body;

  if (!clerkId || !email) {
    return res.status(400).json({ error: "clerkId and email are required" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email },
      create: { clerkId, email, name },
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  const clerkId = getClerkUserId(req);
  const { name, phone, avatar, bio, newsletter, notifications } = req.body;

  if (!clerkId || typeof clerkId !== "string") {
    return res.status(400).json({ error: "clerkId is required" });
  }

  const data: Prisma.UserUpdateInput = {};

  if (name !== undefined) {
    if (name !== null && typeof name !== "string") {
      return res.status(400).json({ error: "name must be a string or null" });
    }
    data.name = name;
  }
  if (phone !== undefined) {
    if (phone !== null && typeof phone !== "string") {
      return res.status(400).json({ error: "phone must be a string or null" });
    }
    data.phone = phone;
  }
  if (avatar !== undefined) {
    if (avatar !== null && typeof avatar !== "string") {
      return res.status(400).json({ error: "avatar must be a string or null" });
    }
    data.avatar = avatar;
  }
  if (bio !== undefined) {
    if (bio !== null && typeof bio !== "string") {
      return res.status(400).json({ error: "bio must be a string or null" });
    }
    data.bio = bio;
  }
  if (newsletter !== undefined) {
    if (typeof newsletter !== "boolean") {
      return res.status(400).json({ error: "newsletter must be a boolean" });
    }
    data.newsletter = newsletter;
  }
  if (notifications !== undefined) {
    if (typeof notifications !== "boolean") {
      return res.status(400).json({ error: "notifications must be a boolean" });
    }
    data.notifications = notifications;
  }

  if (Object.keys(data).length === 0) {
    return res
      .status(400)
      .json({ error: "At least one profile field is required to update" });
  }

  try {
    const user = await prisma.user.update({
      where: { clerkId },
      data,
    });
    return res.json({ success: true, user });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    const { name, phone, avatar, bio, newsletter, notifications } = req.body;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: { name, phone, avatar, bio, newsletter, notifications },
    });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);

    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await prisma.user.delete({
      where: { clerkId },
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userId = Array.isArray(id) ? id[0] : (id as string);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return res.status(500).json({ error: "Failed to get user by ID" });
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);

    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        addresses: true,
        wishlistItems: true,
        orders: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error getting current user:", error);
    return res.status(500).json({ error: "Failed to get current user" });
  }
};

const orderProduct = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    const { productId, quantity } = req.body;

    if (!clerkId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total: product.price * quantity,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: product.id,
          quantity,
          price: product.price,
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      return newOrder;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    return res.status(200).json({ success: true, order: fullOrder });
  } catch (error) {
    console.error("Error ordering product:", error);
    return res.status(500).json({ error: "Failed to order product" });
  }
};

const checkoutCart = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    for (const item of cartItems) {
      if (!item.product.isActive) {
        return res.status(400).json({
          error: `Product "${item.product.name}" is not available`,
        });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for "${item.product.name}"`,
        });
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return createdOrder;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    return res.status(200).json({ success: true, order: fullOrder });
  } catch (error) {
    console.error("Error during checkout:", error);
    return res.status(500).json({ error: "Failed to checkout" });
  }
};

const addToWishList = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    const { productId } = req.body;

    if (!clerkId || !productId) {
      return res
        .status(400)
        .json({ error: "clerkId and productId are required" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId: user.id, productId: product.id },
      },
      include: { product: true, user: true },
    });

    const wishListItem =
      existing ??
      (await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId: product.id,
        },
        include: {
          product: true,
          user: true,
        },
      }));

    return res.status(200).json({ success: true, wishListItem });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({ error: "Failed to add to wishlist" });
  }
};

const fetchWishlist = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, wishlistItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

const removeFromWishList = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    const { productId } = req.body;

    if (!clerkId || !productId) {
      return res
        .status(400)
        .json({ error: "clerkId and productId are required" });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const removed = await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId },
    });

    if (removed.count === 0) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ error: "Failed to remove from wishlist" });
  }
};

const fetchOrders = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const fetchCart = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
};

const addToCart = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    const { productId, quantity } = req.body as {
      productId?: string;
      quantity?: number;
    };

    if (!clerkId || !productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const qty = typeof quantity === "number" ? Math.floor(quantity) : 1;
    if (!Number.isFinite(qty) || qty < 1) {
      return res
        .status(400)
        .json({ error: "quantity must be a positive integer" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ error: "Product is not available" });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId: user.id, productId: product.id },
      },
    });

    const nextQty = (existing?.quantity ?? 0) + qty;
    if (nextQty > product.stock) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: qty,
        },
      });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId: user.id, productId: product.id },
      },
      include: { product: true },
    });

    return res.status(200).json({ success: true, cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
};

const updateCartItem = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    const { productId, quantity } = req.body as {
      productId?: string;
      quantity?: number;
    };

    if (!clerkId || !productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const qty = typeof quantity === "number" ? Math.floor(quantity) : 0;
    if (!Number.isFinite(qty)) {
      return res.status(400).json({ error: "quantity must be a number" });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (qty <= 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id, productId },
      });
      return res.status(200).json({ success: true });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (qty > product.stock) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId: user.id, productId: product.id },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: qty },
    });

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: existing.id },
      include: { product: true },
    });

    return res.status(200).json({ success: true, cartItem });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({ error: "Failed to update cart item" });
  }
};

const removeFromCart = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    const { productId } = req.body as { productId?: string };

    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (productId === undefined || productId === null || productId === "") {
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
      return res.status(200).json({ success: true, clearedAll: true });
    }

    const removed = await prisma.cartItem.deleteMany({
      where: { userId: user.id, productId },
    });

    if (removed.count === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }
};

const clearCart = async (req: Request, res: Response) => {
  try {
    const clerkId = getClerkUserId(req);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({ error: "Failed to clear cart" });
  }
};

export {
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
};
