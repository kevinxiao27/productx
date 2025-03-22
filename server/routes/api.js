import express from "express";
import * as apiController from "../controllers/apiController.js";

const router = express.Router();

// API routes
router.get("/data", apiController.getData);
router.post("/items", apiController.createItem);

export default router;
