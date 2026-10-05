import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { eventController } from "../controllers/event.controller";
import { requireAdmin, requireOrganizer } from "../middlewares/auth.middleware";

export const adminRouter = Router();

adminRouter.get("/overview", requireOrganizer, (req, res, next) =>
  adminController.getOverview(req, res, next)
);

adminRouter.get("/export", requireOrganizer, (req, res, next) =>
  adminController.exportCsv(req, res, next)
);

adminRouter.post("/users", requireAdmin, (req, res, next) =>
  adminController.promoteUser(req, res, next)
);

adminRouter.post("/events", requireAdmin, (req, res, next) =>
  eventController.createEvent(req, res, next)
);

adminRouter.put("/events/:id", requireAdmin, (req, res, next) =>
  eventController.updateEvent(req, res, next)
);

adminRouter.delete("/events/:id", requireAdmin, (req, res, next) =>
  eventController.deleteEvent(req, res, next)
);

