import type { Request, Response } from "express";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export const syncUser = async (req: Request, res: Response) => {
  const { clerkId, email, name } = req.body;

  if (!clerkId || !email) {
    return res.status(400).json({ error: "clerkId and email are required" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email, name },
      create: { clerkId, email, name },
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { clerkId, name, phone, avatar, bio, newsletter, notifications } =
    req.body;

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
      return res
        .status(400)
        .json({ error: "avatar must be a string or null" });
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
      return res
        .status(400)
        .json({ error: "notifications must be a boolean" });
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

export const createUser = async (req: Request, res: Response) => {};

export const getUsers = async (req: Request, res: Response) => {};

export const updateUser = async (req: Request, res: Response) => {};

export const deleteUser = async (req: Request, res: Response) => {};

export const getUserById = async (req: Request, res: Response) => {};
