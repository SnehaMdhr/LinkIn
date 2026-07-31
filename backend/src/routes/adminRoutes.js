import express from "express";
import {
  getAllUsers,
  getUserDetails,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;