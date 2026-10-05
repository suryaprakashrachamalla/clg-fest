import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.get("/overview", requireAuth, (req, res, next) =>
  dashboardController.getDashboard(req, res, next)
);
