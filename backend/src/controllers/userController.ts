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
      // Keep profile edits (e.g. custom name) and only refresh email on sign-in sync.
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

export {
  syncUser,
  updateProfile,
  updateUser,
  deleteUser,
  getUserById,
  getCurrentUser,
  orderProduct,
};
