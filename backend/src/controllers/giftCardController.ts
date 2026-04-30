import type { Request, Response } from "express";
import { OrderStatus, PaymentStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { getClerkUserId } from "../middleware/authMiddleware";

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

const orderGiftCard = async (req: Request, res: Response) => {
  try {
    const { giftCardId } = req.body;
    const clerkUserId = getClerkUserId(req);

    if (!giftCardId) {
      return res.status(400).json({ error: "Gift card ID is required" });
    }

    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find user by clerkId
    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the gift card
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: giftCardId },
    });

    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    if (giftCard.purchaserId) {
      return res.status(400).json({ error: "Gift card already purchased" });
    }

    if (giftCard.status !== "ACTIVE") {
      return res.status(400).json({ error: "Gift card is not available" });
    }

    // Create order and update gift card in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total: giftCard.initialAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: "CASH" as any,
        },
      });

      // Update gift card with purchaser info
      await tx.giftCard.update({
        where: { id: giftCardId },
        data: {
          purchaserId: user.id,
          purchaserEmail: user.email,
          purchaserName: user.name,
          orderId: newOrder.id,
          activatedAt: new Date(),
        },
      });

      return newOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Error ordering gift card:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while ordering gift card" });
  }
};

export { getAllGiftCards, orderGiftCard };
