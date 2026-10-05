import { Router } from "express";
import { teamController } from "../controllers/team.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { rateLimitMiddleware } from "../middlewares/rate-limit.middleware";

export const teamRouter = Router();

teamRouter.get("/lookup", rateLimitMiddleware(60, 60_000, "team_lookup"), (req, res, next) =>
  teamController.lookupInvitation(req, res, next)
);

teamRouter.post("/join", requireAuth, rateLimitMiddleware(15, 60_000, "team_join"), (req, res, next) =>
  teamController.joinTeam(req, res, next)
);
