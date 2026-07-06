import express from "express";
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";

const router = express.Router();

// NOTE: No admin-auth middleware yet — anyone can call these routes directly
// via Postman today. Real RBAC middleware comes in Phase 2 (Day 2+).
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;