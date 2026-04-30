import { Router } from "express";
import { getAllGiftCards } from "../controllers/giftCardController";

const router = Router();

router.get("/gift-cards", getAllGiftCards);

export default router;
