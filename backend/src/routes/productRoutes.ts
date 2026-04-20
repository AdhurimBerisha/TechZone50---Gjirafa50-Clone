import { Router } from "express";
import { getProductById, getProducts } from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
export default router;
