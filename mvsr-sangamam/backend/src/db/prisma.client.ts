import { PrismaClient, Prisma } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export type Tx = Prisma.TransactionClient;

export const REGISTRATION_INCLUDE = {
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
} as const;
