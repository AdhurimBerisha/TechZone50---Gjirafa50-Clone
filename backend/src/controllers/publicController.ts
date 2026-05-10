import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getPublicSettings = async (req: Request, res: Response) => {
  const settings = await prisma.storeSettings.findFirst();
  res.json(settings ?? {});
};
