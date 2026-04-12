import { Router } from "express";
import {
  syncUser,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserById,
} from "../controllers/userController.js";

const router = Router();

router.post("/sync", syncUser);
router.post("/create", createUser);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
