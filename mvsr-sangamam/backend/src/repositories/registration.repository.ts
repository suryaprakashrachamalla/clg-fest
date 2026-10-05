import { prisma } from "../db/prisma.client";
import { Registration, RegistrationStatus, Prisma } from "@prisma/client";
import { eventRepository } from "./event.repository";

type Tx = Prisma.TransactionClient;

export const registrationInclude = {
  event: true,
  payments: { orderBy: { createdAt: "desc" as const }, take: 1 },
  team: {
    include: {
      invitation: true,
      members: { orderBy: { joinedAt: "asc" as const } },
    },
  },
  checkIn: {
    include: {
      checkedInBy: { select: { name: true } },
    },
  },
} satisfies Prisma.RegistrationInclude;

export class RegistrationRepository {
  async findById(id: string) {
    return prisma.registration.findUnique({
      where: { id },
      include: registrationInclude,
    });
  }

  async findByCode(code: string) {
    return prisma.registration.findUnique({
      where: { code },
      include: registrationInclude,
    });
  }

  async findByActiveKey(activeKey: string) {
    return prisma.registration.findUnique({
      where: { activeKey },
    });
  }

  async findByQrToken(qrToken: string) {
    return prisma.registration.findUnique({
      where: { qrToken },
      include: registrationInclude,
    });
  }

  async findByUser(userId: string) {
    return prisma.registration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: registrationInclude,
    });
  }

  async findStalePending(eventId?: string, take = 200) {
    return prisma.registration.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
        ...(eventId ? { eventId } : {}),
      },
      select: { id: true },
      take,
    });
  }

  async release(id: string, to: "EXPIRED" | "CANCELLED"): Promise<boolean> {
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

      await eventRepository.releaseSlot(tx, reg.eventId);
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

  async count(where?: Prisma.RegistrationWhereInput): Promise<number> {
    return prisma.registration.count({ where });
  }

  async findAllAdmin(search?: string, eventFilter?: string) {
    return prisma.registration.findMany({
      where: {
        ...(eventFilter && eventFilter !== "ALL" ? { eventId: eventFilter } : {}),
        ...(search
          ? {
              OR: [
                { code: { contains: search, mode: "insensitive" } },
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { teamName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: registrationInclude,
    });
  }
}

export const registrationRepository = new RegistrationRepository();
