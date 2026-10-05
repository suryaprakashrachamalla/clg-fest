import { Router } from "express";
import { eventController } from "../controllers/event.controller";
import { requireAdmin } from "../middlewares/auth.middleware";

export const eventRouter = Router();

eventRouter.get("/", (req, res, next) => eventController.listEvents(req, res, next));
eventRouter.get("/stats", (req, res, next) => eventController.getStats(req, res, next));
eventRouter.get("/:slug/availability", (req, res, next) => eventController.getAvailability(req, res, next));
eventRouter.get("/:slug", (req, res, next) => eventController.getEvent(req, res, next));

eventRouter.post("/", requireAdmin, (req, res, next) => eventController.createEvent(req, res, next));
eventRouter.put("/:id", requireAdmin, (req, res, next) => eventController.updateEvent(req, res, next));
eventRouter.delete("/:id", requireAdmin, (req, res, next) => eventController.deleteEvent(req, res, next));
