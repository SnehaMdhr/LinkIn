import express from "express";
import { getLinks, createLink, updateLink, deleteLink, getLinkById, reorderLinks } from "../controllers/linkController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getLinks);
router.post("/", verifyToken, createLink);
router.put("/reorder", verifyToken, reorderLinks);
router.put("/:id", verifyToken, updateLink);
router.get("/single/:id", verifyToken, getLinkById);
router.delete("/:id", verifyToken, deleteLink);

export default router;