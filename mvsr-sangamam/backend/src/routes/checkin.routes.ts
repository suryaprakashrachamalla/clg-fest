import { Router } from "express";
import { checkinController } from "../controllers/checkin.controller";
import { requireOrganizer } from "../middlewares/auth.middleware";
import { rateLimitMiddleware } from "../middlewares/rate-limit.middleware";

export const checkinRouter = Router();

checkinRouter.get("/:token", (req, res, next) =>
  checkinController.getVerificationCard(req, res, next)
);

checkinRouter.post(
  "/",
  requireOrganizer,
  rateLimitMiddleware(120, 60_000, "checkin"),
  (req, res, next) => checkinController.processCheckIn(req, res, next)
);
