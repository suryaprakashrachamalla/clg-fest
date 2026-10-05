import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { optionalAuth } from "../middlewares/auth.middleware";
import { rateLimitMiddleware } from "../middlewares/rate-limit.middleware";

export const paymentRouter = Router();

paymentRouter.post(
  "/verify",
  rateLimitMiddleware(30, 60_000, "pay_verify"),
  (req, res, next) => paymentController.verifyPayment(req, res, next)
);

paymentRouter.post(
  "/failure",
  optionalAuth,
  (req, res, next) => paymentController.paymentFailure(req, res, next)
);
