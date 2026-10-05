import { Event, User, Prisma } from "@prisma/client";
import { prisma, REGISTRATION_INCLUDE, Tx } from "../db/prisma.client";
import { computeAmount } from "../utils/pricing.util";
import { newRegistrationCode, newInvitationCode, newQrToken, generateTeamCode } from "../utils/code-generator.util";
import { createRazorpayOrder, getPublicKeyId } from "../integrations/razorpay.client";
import { FEST } from "../config/fest.config";
import { CreateRegistrationInput } from "../validators/registration.validator";
import { HttpError } from "../utils/response.util";

const activeKeyOf = (userId: string, eventId: string) => `${userId}:${eventId}`;

const isUniqueError = (e: unknown, field?: string) =>
  e instanceof Prisma.PrismaClientKnownRequestError &&
  e.code === "P2002" &&
  (!field || JSON.stringify(e.meta?.target ?? "").includes(field));

export class RegistrationService {
  async expireStaleRegistrations(eventId?: string) {
    const stale = await prisma.registration.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
        ...(eventId ? { eventId } : {}),
      },
      select: { id: true },
      take: 200,
    });
    for (const r of stale) {
      await this.releaseRegistration(r.id, "EXPIRED");
    }
    return stale.length;
  }

  async releaseRegistration(id: string, to: "EXPIRED" | "CANCELLED"): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id },
        select: { eventId: true },
      });
      if (!reg) return false;

      const res = await tx.registration.updateMany({
        where: { id, status: "PENDING" },
        data: { status: to, activeKey: null },
      });
      if (res.count !== 1) return false;

      await tx.$executeRaw`
        UPDATE "Event" SET "slotsTaken" = GREATEST("slotsTaken" - 1, 0), "updatedAt" = NOW()
        WHERE "id" = ${reg.eventId}`;
      await tx.team.deleteMany({ where: { registrationId: id } });
      await tx.payment.updateMany({
        where: { registrationId: id, status: { in: ["CREATED", "CANCELLED"] } },
        data: {
          status: to === "EXPIRED" ? "EXPIRED" : "CANCELLED",
          failureReason:
            to === "EXPIRED" ? "Payment window expired" : "Cancelled by participant",
        },
      });
      return true;
    });
  }

  async getRegistrationById(id: string) {
    return prisma.registration.findUnique({
      where: { id },
      include: REGISTRATION_INCLUDE,
    });
  }

  async createRegistration(user: User, input: CreateRegistrationInput) {
    const event = await prisma.event.findUnique({ where: { slug: input.eventSlug } });
    if (!event || !event.isPublished) throw new HttpError(404, "Event not found.", "NOT_FOUND");
    if (!event.registrationOpen || event.endsAt < new Date()) {
      throw new HttpError(400, "Registrations for this event are closed.", "CLOSED");
    }

    const p = { ...input.participant, email: user.email };
    if (event.requiresStudentId && !p.studentId) {
      throw new HttpError(400, "Student ID is required for this event.", "VALIDATION");
    }

    const isTeam = event.participationType === "TEAM";
    const teamSize = isTeam ? input.teamSize : 1;
    if (isTeam) {
      if (teamSize < event.minTeamSize || teamSize > event.maxTeamSize) {
        throw new HttpError(
          400,
          `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}.`,
          "VALIDATION"
        );
      }
      if (!input.teamName) throw new HttpError(400, "Team name is required.", "VALIDATION");
    }
    const amount = computeAmount(event, teamSize);

    await this.expireStaleRegistrations(event.id);

    const existing = await prisma.registration.findUnique({
      where: { activeKey: activeKeyOf(user.id, event.id) },
    });
    if (existing) {
      if (existing.status === "CONFIRMED") {
        throw new HttpError(409, "You are already registered for this event.", "ALREADY_REGISTERED");
      }
      throw new HttpError(409, "You have a registration awaiting payment for this event.", "PENDING_EXISTS", {
        registrationId: existing.id,
      });
    }

    if (isTeam) {
      const membership = await prisma.teamMember.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: user.id } },
      });
      if (membership) throw new HttpError(409, "You are already part of a team for this event.", "ALREADY_IN_TEAM");

      const nameTaken = await prisma.team.findUnique({
        where: { eventId_name: { eventId: event.id, name: input.teamName! } },
      });
      if (nameTaken) throw new HttpError(409, "That team name is already taken. Try another.", "TEAM_NAME_TAKEN");
    }

    const expiresAt = new Date(Date.now() + FEST.paymentWindowMinutes * 60_000);

    let reg;
    for (let attempt = 0; ; attempt++) {
      try {
        reg = await prisma.$transaction(async (tx) => {
          const reserved = await tx.$executeRaw`
            UPDATE "Event" SET "slotsTaken" = "slotsTaken" + 1, "updatedAt" = NOW()
            WHERE "id" = ${event.id} AND ("capacity" IS NULL OR "slotsTaken" < "capacity")`;
          if (reserved !== 1) {
            throw new HttpError(409, isTeam ? "All team slots are taken." : "This event is full.", "FULL");
          }
          const r = await tx.registration.create({
            data: {
              code: newRegistrationCode(),
              userId: user.id,
              eventId: event.id,
              activeKey: activeKeyOf(user.id, event.id),
              participantCount: teamSize,
              amount,
              fullName: p.fullName,
              email: p.email,
              phone: p.phone,
              college: p.college,
              studentId: p.studentId ?? null,
              teamName: isTeam ? input.teamName! : null,
              expiresAt,
            },
          });

          if (isTeam) {
            await tx.team.create({
              data: {
                name: input.teamName!,
                eventId: event.id,
                leaderId: user.id,
                registrationId: r.id,
                paidCapacity: teamSize,
                memberCount: 1,
                members: {
                  create: {
                    userId: user.id,
                    eventId: event.id,
                    role: "LEADER",
                    fullName: p.fullName,
                    email: p.email,
                    phone: p.phone,
                    college: p.college,
                    studentId: p.studentId ?? null,
                  },
                },
              },
            });
          }

          if (amount === 0) {
            await this.confirmInTx(tx, r.id, event);
          }
          return r;
        });
        break;
      } catch (e) {
        if (isUniqueError(e, "code") && attempt < 4) continue;
        if (isUniqueError(e, "activeKey")) throw new HttpError(409, "You already have a registration for this event.", "ALREADY_REGISTERED");
        if (isUniqueError(e, "name")) throw new HttpError(409, "That team name is already taken. Try another.", "TEAM_NAME_TAKEN");
        if (isUniqueError(e, "userId")) throw new HttpError(409, "You are already part of a team for this event.", "ALREADY_IN_TEAM");
        throw e;
      }
    }

    if (amount === 0) {
      return { registrationId: reg.id, code: reg.code, amount, free: true as const };
    }

    try {
      const checkout = await this.createOrderFor(reg.id, reg.code, amount, event, user);
      return { registrationId: reg.id, code: reg.code, amount, free: false as const, checkout, expiresAt };
    } catch (e) {
      await this.releaseRegistration(reg.id, "CANCELLED");
      throw e;
    }
  }

  async resumeCheckout(user: User, registrationId: string) {
    await this.expireStaleRegistrations();
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true, payments: { orderBy: { createdAt: "desc" } } },
    });
    if (!reg || reg.userId !== user.id) throw new HttpError(404, "Registration not found.", "NOT_FOUND");
    if (reg.status === "CONFIRMED") throw new HttpError(409, "This registration is already paid.", "ALREADY_PAID");
    if (reg.status !== "PENDING") throw new HttpError(410, "This payment window has expired. Please register again.", "EXPIRED");

    const open = reg.payments.find((p) => p.status === "CREATED" || p.status === "FAILED" || p.status === "CANCELLED");
    const checkout = open
      ? this.checkoutPayload(open.razorpayOrderId, open.amount, reg.event, user, reg.code)
      : await this.createOrderFor(reg.id, reg.code, reg.amount, reg.event, user);
    return { registrationId: reg.id, code: reg.code, amount: reg.amount, checkout, expiresAt: reg.expiresAt };
  }

  private async createOrderFor(registrationId: string, code: string, amount: number, event: Event, user: User) {
    const order = await createRazorpayOrder({
      amountPaise: amount * 100,
      receipt: code,
      notes: { registrationId, registrationCode: code, event: event.slug },
    });
    await prisma.payment.create({
      data: {
        registrationId,
        razorpayOrderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        status: "CREATED",
      },
    });
    return this.checkoutPayload(order.id, Number(order.amount), event, user, code);
  }

  private checkoutPayload(orderId: string, amountPaise: number, event: Event, user: User, code: string) {
    return {
      keyId: getPublicKeyId(),
      orderId,
      amount: amountPaise,
      currency: "INR",
      name: `${FEST.name} ${FEST.edition}`,
      description: `${event.name} · ${code}`,
      prefill: { name: user.name, email: user.email, contact: user.phone },
    };
  }

  async confirmInTx(tx: Tx, registrationId: string, event: Event) {
    const res = await tx.registration.updateMany({
      where: { id: registrationId, status: "PENDING" },
      data: { status: "CONFIRMED", confirmedAt: new Date(), qrToken: newQrToken() },
    });
    if (res.count !== 1) return false;
    await this.activateTeam(tx, registrationId, event);
    return true;
  }

  private async activateTeam(tx: Tx, registrationId: string, event: Event) {
    const team = await tx.team.findUnique({ where: { registrationId } });
    if (!team) return;
    const updated = await tx.event.update({
      where: { id: event.id },
      data: { teamSeq: { increment: 1 } },
      select: { teamSeq: true },
    });
    const prefix = event.teamCodePrefix || `TEAM-${FEST.edition}`;
    await tx.team.update({
      where: { id: team.id },
      data: { status: "ACTIVE", code: generateTeamCode(prefix, updated.teamSeq) },
    });
    if (team.paidCapacity > team.memberCount) {
      await tx.invitationCode.create({
        data: { code: newInvitationCode(), teamId: team.id, expiresAt: event.startsAt },
      });
    }
  }
}

export const registrationService = new RegistrationService();
