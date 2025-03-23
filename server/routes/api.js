import express from "express";
import { getAllAlertEvents, getAlertEventById, createAlertEvent, deleteAlertEvent } from "../controllers/apiController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// AlertEventLogs CRUD routes
router.get("/alerts", getAllAlertEvents);
router.get("/alerts/:id", getAlertEventById);
router.post("/alerts", upload.single("video"), createAlertEvent);
router.delete("/alerts/:id", deleteAlertEvent);

export default router;
