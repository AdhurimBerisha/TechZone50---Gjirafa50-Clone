import { getAuth, requireAuth } from "@clerk/express";
import type { Request } from "express";

export const requireClerkAuth = requireAuth();

export const getClerkUserId = (req: Request): string | null => {
  const { userId } = getAuth(req);
  return userId ?? null;
};
