import { prisma } from "../db/prisma.client";
import { Event, Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export class EventRepository {
  async findPublished(): Promise<Event[]> {
    return prisma.event.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
    });
  }

  async findAll(): Promise<Event[]> {
    return prisma.event.findMany({
      orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
    });
  }

  async findBySlug(slug: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { slug } });
  }

  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } });
  }

  async create(data: Prisma.EventCreateInput): Promise<Event> {
    return prisma.event.create({ data });
  }

  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return prisma.event.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Event> {
    return prisma.event.delete({ where: { id } });
  }

  async countPublished(): Promise<number> {
    return prisma.event.count({ where: { isPublished: true } });
  }

  /** Atomic reservation using row-level update condition */
  async reserveSlot(tx: Tx, eventId: string): Promise<boolean> {
    const n = await tx.$executeRaw`
      UPDATE "Event" SET "slotsTaken" = "slotsTaken" + 1, "updatedAt" = NOW()
      WHERE "id" = ${eventId} AND ("capacity" IS NULL OR "slotsTaken" < "capacity")`;
    return n === 1;
  }

  /** Atomic release of a reserved slot */
  async releaseSlot(tx: Tx, eventId: string): Promise<void> {
    await tx.$executeRaw`
      UPDATE "Event" SET "slotsTaken" = GREATEST("slotsTaken" - 1, 0), "updatedAt" = NOW()
      WHERE "id" = ${eventId}`;
  }

  async incrementTeamSeq(tx: Tx, eventId: string): Promise<number> {
    const updated = await tx.event.update({
      where: { id: eventId },
      data: { teamSeq: { increment: 1 } },
      select: { teamSeq: true },
    });
    return updated.teamSeq;
  }
}

export const eventRepository = new EventRepository();
