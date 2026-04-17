import { Router } from "express";
import {
  syncUser,
  updateProfile,
  updateUser,
  deleteUser,
  getUserById,
} from "../controllers/userController.js";

const router = Router();

router.post("/sync", syncUser);
router.put("/profile", updateProfile);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
