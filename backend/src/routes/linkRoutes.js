import express from "express";
import { getLinks, createLink, updateLink, deleteLink,getLinkById } from "../controllers/linkController.js";

const router = express.Router();

router.get("/", getLinks);
router.post("/", createLink);
router.put("/:id", updateLink);
router.get("/single/:id", getLinkById); 
router.delete("/:id", deleteLink);

export default router;