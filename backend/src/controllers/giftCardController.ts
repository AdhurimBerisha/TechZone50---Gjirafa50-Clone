import type { Request, Response } from "express";
import { OrderStatus, PaymentStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

const getAllGiftCards = async (req: Request, res: Response) => {
  try {
    const giftCards = await prisma.giftCard.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(giftCards);
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching gift cards" });
  }
};

export { getAllGiftCards };
