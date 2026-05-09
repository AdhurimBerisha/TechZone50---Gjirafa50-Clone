import { Router } from "express";
import { getPublicSettings } from "../controllers/publicController";

const router = Router();

router.get("/settings", getPublicSettings);

export default router;
