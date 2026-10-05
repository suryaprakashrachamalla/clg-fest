import { Request, Response, NextFunction } from "express";
import { checkinService } from "../services/checkin.service";
import { checkinTokenSchema } from "../validators/admin.validator";
import { parseQrPayload } from "../utils/qr.util";
import { sendSuccess, HttpError } from "../utils/response.util";
import { AuthenticatedRequest } from "../types";

export class CheckinController {
  async getVerificationCard(req: Request, res: Response, next: NextFunction) {
    try {
      const token = String(req.params.token);
      const cleanToken = parseQrPayload(token) ?? token;
      const card = await checkinService.getVerificationCard(cleanToken);
      if (!card) throw new HttpError(404, "Invalid or unknown verification token.", "NOT_FOUND");
      return sendSuccess(res, card);
    } catch (err) {
      next(err);
    }
  }

  async processCheckIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { token } = checkinTokenSchema.parse(req.body);
      const cleanToken = parseQrPayload(token) ?? token;
      const result = await checkinService.processCheckIn(cleanToken, user);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const checkinController = new CheckinController();
