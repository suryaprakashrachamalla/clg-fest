import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.client";
import { registrationService } from "./registration.service";
import { verifyCheckoutSignature, fetchPaymentDetails } from "../integrations/razorpay.client";
import { HttpError } from "../utils/response.util";

const activeKeyOf = (userId: string, eventId: string) => `${userId}:${eventId}`;

const isUniqueError = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export type ConfirmResult =
  | { status: "confirmed" | "already_confirmed"; registrationId: string }
  | { status: "refund_required"; registrationId: string; reason: string };

export class PaymentService {
  async verifyAndConfirm(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<ConfirmResult> {
    const isValid = verifyCheckoutSignature(params.orderId, params.paymentId, params.signature);
    if (!isValid) {
      throw new HttpError(400, "Payment signature verification failed.", "BAD_SIGNATURE");
    }

    const details = await fetchPaymentDetails(params.paymentId);
    return this.confirmPayment({
      orderId: params.orderId,
      paymentId: params.paymentId,
      signature: params.signature,
      method: details?.method,
    });
  }

  async confirmPayment(args: {
    orderId: string;
    paymentId: string;
    signature?: string;
    method?: string;
  }): Promise<ConfirmResult> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          const locked = await tx.$queryRaw<{ id: string }[]>`
            SELECT "id" FROM "Payment" WHERE "razorpayOrderId" = ${args.orderId} FOR UPDATE`;
          if (locked.length === 0) throw new HttpError(404, "Unknown payment order.", "NOT_FOUND");

          const payment = await tx.payment.findUniqueOrThrow({
            where: { razorpayOrderId: args.orderId },
            include: { registration: { include: { event: true } } },
          });
          const reg = payment.registration;

          if (payment.status === "PAID") {
            if (payment.razorpayPaymentId === args.paymentId) {
              return { status: "already_confirmed", registrationId: reg.id } as const;
            }
            console.warn("[PaymentService] duplicate payment on paid order", args);
            return { status: "refund_required", registrationId: reg.id, reason: "Duplicate payment" } as const;
          }
          if (payment.status === "REFUND_REQUIRED") {
            return {
              status: "refund_required",
              registrationId: reg.id,
              reason: payment.failureReason ?? "Refund pending",
            } as const;
          }

          const markPaid = (status: "PAID" | "REFUND_REQUIRED", failureReason?: string) =>
            tx.payment.update({
              where: { id: payment.id },
              data: {
                status,
                razorpayPaymentId: args.paymentId,
                razorpaySignature: args.signature ?? payment.razorpaySignature,
                method: args.method ?? payment.method,
                failureReason: failureReason ?? null,
              },
            });

          if (reg.status === "CONFIRMED") {
            const reason = "Duplicate payment — registration was already confirmed";
            await markPaid("REFUND_REQUIRED", reason);
            return { status: "refund_required", registrationId: reg.id, reason } as const;
          }

          if (reg.status === "PENDING") {
            await markPaid("PAID");
            await registrationService.confirmInTx(tx, reg.id, reg.event);
            return { status: "confirmed", registrationId: reg.id } as const;
          }

          // EXPIRED / CANCELLED / FAILED: revive slot if possible
          const refund = async (reason: string) => {
            await markPaid("REFUND_REQUIRED", reason);
            await tx.registration.update({ where: { id: reg.id }, data: { status: "FAILED" } });
            return { status: "refund_required", registrationId: reg.id, reason } as const;
          };

          const key = activeKeyOf(reg.userId, reg.eventId);
          if (await tx.registration.findUnique({ where: { activeKey: key } })) {
            return refund("Payment received after timeout; you already hold another registration for this event");
          }
          if (reg.teamName) {
            const inTeam = await tx.teamMember.findUnique({
              where: { eventId_userId: { eventId: reg.eventId, userId: reg.userId } },
            });
            const nameTaken = await tx.team.findUnique({
              where: { eventId_name: { eventId: reg.eventId, name: reg.teamName } },
            });
            if (inTeam || nameTaken) return refund("Payment received after timeout; team could not be re-created");
          }
          const reserved = await tx.$executeRaw`
            UPDATE "Event" SET "slotsTaken" = "slotsTaken" + 1, "updatedAt" = NOW()
            WHERE "id" = ${reg.eventId} AND ("capacity" IS NULL OR "slotsTaken" < "capacity")`;
          if (reserved !== 1) {
            return refund("Payment received after timeout and the event is now full");
          }

          await tx.registration.update({
            where: { id: reg.id },
            data: { status: "PENDING", activeKey: key },
          });
          if (reg.teamName) {
            await tx.team.create({
              data: {
                name: reg.teamName,
                eventId: reg.eventId,
                leaderId: reg.userId,
                registrationId: reg.id,
                paidCapacity: reg.participantCount,
                memberCount: 1,
                members: {
                  create: {
                    userId: reg.userId,
                    eventId: reg.eventId,
                    role: "LEADER",
                    fullName: reg.fullName,
                    email: reg.email,
                    phone: reg.phone,
                    college: reg.college,
                    studentId: reg.studentId,
                  },
                },
              },
            });
          }
          await markPaid("PAID");
          await registrationService.confirmInTx(tx, reg.id, reg.event);
          return { status: "confirmed", registrationId: reg.id } as const;
        });
      } catch (e) {
        if (isUniqueError(e) && attempt < 4) continue;
        throw e;
      }
    }
  }

  async recordPaymentFailure(args: {
    orderId: string;
    kind: "failed" | "cancelled";
    reason?: string;
    userId?: string;
  }) {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: args.orderId },
      include: { registration: true },
    });
    if (!payment) return null;
    if (args.userId && payment.registration.userId !== args.userId) {
      throw new HttpError(404, "Payment not found.", "NOT_FOUND");
    }
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { in: ["CREATED", "FAILED", "CANCELLED"] } },
      data: {
        status: args.kind === "failed" ? "FAILED" : "CANCELLED",
        failureReason: (
          args.reason ?? (args.kind === "failed" ? "Payment failed" : "Checkout closed by participant")
        ).slice(0, 300),
      },
    });
    return payment.registrationId;
  }
}

export const paymentService = new PaymentService();
