import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getClerkUserId } from "./authMiddleware";

/**
 * Requires a Clerk-authenticated user whose DB row has role ADMIN.
 * Use after requireClerkAuth on admin routes.
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const clerkId = getClerkUserId(req);
  if (!clerkId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true },
    });

    if (!user) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    next();
  } catch (e) {
    console.error("requireAdmin:", e);
    res.status(500).json({ error: "Authorization failed" });
  }
};
