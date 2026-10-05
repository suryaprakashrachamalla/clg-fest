import { Response, NextFunction } from "express";
import { registrationService } from "../services/registration.service";
import { createRegistrationSchema } from "../validators/registration.validator";
import { sendSuccess, HttpError } from "../utils/response.util";
import { qrDataUrl, invitationUrl } from "../utils/qr.util";
import { AuthenticatedRequest } from "../types";

export class RegistrationController {
  async createRegistration(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const input = createRegistrationSchema.parse(req.body);
      const result = await registrationService.createRegistration(user, input);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async resumeCheckout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const result = await registrationService.resumeCheckout(user, id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getRegistration(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const reg = await registrationService.getRegistrationById(id);

      if (!reg || (reg.userId !== user.id && user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
        throw new HttpError(404, "Registration not found.", "NOT_FOUND");
      }

      const qrImage = reg.qrToken ? await qrDataUrl(reg.qrToken) : null;
      const inviteLink = reg.team?.invitation?.code ? invitationUrl(reg.team.invitation.code) : null;

      return sendSuccess(res, {
        registration: {
          id: reg.id,
          code: reg.code,
          status: reg.status,
          amount: reg.amount,
          createdAt: reg.createdAt.toISOString(),
          fullName: reg.fullName,
          email: reg.email,
          phone: reg.phone,
          college: reg.college,
          studentId: reg.studentId,
          teamName: reg.teamName,
        },
        event: {
          name: reg.event.name,
          category: reg.event.category,
          venue: reg.event.venue,
          startsAt: reg.event.startsAt.toISOString(),
        },
        team: reg.team
          ? {
              code: reg.team.code,
              name: reg.team.name,
              paidCapacity: reg.team.paidCapacity,
              memberCount: reg.team.memberCount,
              invitationCode: reg.team.invitation?.code,
              inviteLink,
              members: reg.team.members.map((m) => ({
                name: m.fullName,
                role: m.role,
                college: m.college,
              })),
            }
          : null,
        qrImage,
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelRegistration(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const reg = await registrationService.getRegistrationById(id);

      if (!reg || (reg.userId !== user.id && user.role !== "ADMIN")) {
        throw new HttpError(404, "Registration not found.", "NOT_FOUND");
      }

      if (reg.status !== "PENDING") {
        throw new HttpError(400, "Only pending registrations can be cancelled.", "INVALID_STATE");
      }

      const released = await registrationService.releaseRegistration(id, "CANCELLED");
      return sendSuccess(res, { success: released });
    } catch (err) {
      next(err);
    }
  }
}

export const registrationController = new RegistrationController();
