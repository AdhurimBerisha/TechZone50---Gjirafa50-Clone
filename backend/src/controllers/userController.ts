import type { Request, Response } from "express";
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

export const createUser = async (req: Request, res: Response) => {};

export const getUsers = async (req: Request, res: Response) => {};

export const updateUser = async (req: Request, res: Response) => {};

export const deleteUser = async (req: Request, res: Response) => {};

export const getUserById = async (req: Request, res: Response) => {};
