import express from "express";
import { getData, createItem } from "../controllers/apiController.js";

const router = express.Router();

// API routes
router.get("/data", getData);
router.post("/items", createItem);

export default router;
