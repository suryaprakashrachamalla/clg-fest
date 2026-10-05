import { prisma } from "./db/prisma.client";
import { FEST } from "./config/fest.config";
import { computeAmount } from "./utils/pricing.util";
import { registrationService } from "./services/registration.service";
import { paymentService } from "./services/payment.service";
import { teamService } from "./services/team.service";
import { checkinService } from "./services/checkin.service";
import { authService } from "./services/auth.service";
import { eventService } from "./services/event.service";
import { adminService } from "./services/admin.service";
import { dashboardService } from "./services/dashboard.service";

export {
  prisma,
  FEST,
  computeAmount,
  registrationService,
  paymentService,
  teamService,
  checkinService,
  authService,
  eventService,
  adminService,
  dashboardService,
};

// Facade helpers matching common service operations
export const createRegistration = (user: any, input: any) =>
  registrationService.createRegistration(user, input);

export const confirmPayment = (args: any) =>
  paymentService.confirmPayment(args);

export const joinTeam = (user: any, code: string, participant: any) =>
  teamService.joinTeam(user, code, participant);

export const lookupInvitation = (code: string) =>
  teamService.lookupInvitation(code);

export const checkIn = (token: string, organizer: any) =>
  checkinService.processCheckIn(token, organizer);

export const verificationCard = (token: string) =>
  checkinService.getVerificationCard(token);
