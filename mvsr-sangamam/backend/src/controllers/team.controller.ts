import { Request, Response, NextFunction } from "express";
import { teamService } from "../services/team.service";
import { invitationCodeSchema, joinTeamSchema } from "../validators/team.validator";
import { sendSuccess, HttpError } from "../utils/response.util";
import { AuthenticatedRequest } from "../types";

export class TeamController {
  async lookupInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const code = String(req.query.code ?? "").trim();
      if (!code) throw new HttpError(400, "Invitation code query parameter is required.", "MISSING_CODE");

      const validatedCode = invitationCodeSchema.parse(code);
      const result = await teamService.lookupInvitation(validatedCode);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async joinTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const input = joinTeamSchema.parse(req.body);
      const result = await teamService.joinTeam(user, input.code, input.participant);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const teamController = new TeamController();
