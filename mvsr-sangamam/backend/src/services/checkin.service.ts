import { Prisma, User } from "@prisma/client";
import { prisma } from "../db/prisma.client";
import { registrationRepository } from "../repositories/registration.repository";
import { HttpError } from "../utils/response.util";

export class CheckinService {
  async getVerificationCard(token: string) {
    const r = await registrationRepository.findByQrToken(token);
    if (!r) return null;
    return {
      registrationId: r.id,
      code: r.code,
      status: r.status,
      paymentStatus: r.amount === 0 ? "FREE" : r.payments.length ? "PAID" : "UNPAID",
      amount: r.amount,
      event: r.event,
      participant: {
        name: r.fullName,
        college: r.college,
        phone: r.phone,
        email: r.email,
      },
      team: r.team
        ? {
            code: r.team.code,
            name: r.team.name,
            paidCapacity: r.team.paidCapacity,
            memberCount: r.team.memberCount,
            members: r.team.members.map((m) => ({
              name: m.fullName,
              role: m.role,
              college: m.college,
              phone: m.phone,
            })),
          }
        : null,
      checkIn: r.checkIn
        ? {
            at: r.checkIn.checkedInAt.toISOString(),
            by: r.checkIn.checkedInBy.name,
          }
        : null,
    };
  }

  async processCheckIn(token: string, organizer: User) {
    const r = await registrationRepository.findByQrToken(token);
    if (!r) throw new HttpError(404, "Invalid QR code.", "INVALID");
    if (r.status !== "CONFIRMED") throw new HttpError(409, "Registration is not confirmed.", "NOT_CONFIRMED");

    const existing = await prisma.checkIn.findUnique({
      where: { registrationId: r.id },
    });
    if (existing) {
      return { status: "already" as const, card: await this.getVerificationCard(token) };
    }

    try {
      await prisma.checkIn.create({
        data: { registrationId: r.id, checkedInById: organizer.id },
      });
      return { status: "checked_in" as const, card: await this.getVerificationCard(token) };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { status: "already" as const, card: await this.getVerificationCard(token) };
      }
      throw e;
    }
  }
}

export const checkinService = new CheckinService();
