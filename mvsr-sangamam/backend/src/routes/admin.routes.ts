import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
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
