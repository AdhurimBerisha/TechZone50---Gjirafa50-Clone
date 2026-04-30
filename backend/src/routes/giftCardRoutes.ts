import { Router } from "express";
import { getAllGiftCards } from "../controllers/giftCardController";

const router = Router();

router.get("/", getAllGiftCards);

export default router;
