import express from "express";
import {
  getAllAlertEvents,
  getAlertEventById,
  createAlertEvent,
  updateAlertEvent,
  deleteAlertEvent
} from "../controllers/apiController.js";

const router = express.Router();

// AlertEventLogs CRUD routes
router.get("/alerts", getAllAlertEvents);
router.get("/alerts/:id", getAlertEventById);
router.post("/alerts", createAlertEvent);
router.put("/alerts/:id", updateAlertEvent);
router.delete("/alerts/:id", deleteAlertEvent);

export default router;
