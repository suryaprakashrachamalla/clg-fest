import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { rateLimitMiddleware } from "../middlewares/rate-limit.middleware";

export const authRouter = Router();

authRouter.post("/signup", rateLimitMiddleware(15, 60_000, "signup"), (req, res, next) =>
  authController.signup(req, res, next)
);

authRouter.post("/login", rateLimitMiddleware(15, 60_000, "login"), (req, res, next) =>
  authController.login(req, res, next)
);

authRouter.post("/logout", (req, res) => authController.logout(req, res));

authRouter.get("/me", requireAuth, (req, res) => authController.getMe(req, res));
