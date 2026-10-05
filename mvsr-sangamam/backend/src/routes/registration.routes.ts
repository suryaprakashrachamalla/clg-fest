import { Router } from "express";
import { registrationController } from "../controllers/registration.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { rateLimitMiddleware } from "../middlewares/rate-limit.middleware";

export const registrationRouter = Router();

registrationRouter.post(
  "/",
  requireAuth,
  rateLimitMiddleware(20, 60_000, "register"),
  (req, res, next) => registrationController.createRegistration(req, res, next)
);

registrationRouter.get("/:id", requireAuth, (req, res, next) =>
  registrationController.getRegistration(req, res, next)
);

registrationRouter.get("/:id/checkout", requireAuth, (req, res, next) =>
  registrationController.resumeCheckout(req, res, next)
);

registrationRouter.post("/:id/cancel", requireAuth, (req, res, next) =>
  registrationController.cancelRegistration(req, res, next)
);
