import { Event } from "@prisma/client";
import { prisma } from "../db/prisma.client";
import { FEST } from "../config/fest.config";
import { EventInput, UpdateEventInput, eventInputToData, Prize, Coordinator, Faq, splitLines, parsePrizes, parseCoordinators, parseFaqs } from "../validators/event.validator";
import { HttpError } from "../utils/response.util";

export function toPublicEvent(e: Event, confirmedUnits: number) {
  const remaining = e.capacity == null ? null : Math.max(e.capacity - e.slotsTaken, 0);
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    category: e.category,
    tagline: e.tagline,
    description: e.description,
    rules: e.rules,
    eligibility: e.eligibility,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt.toISOString(),
    venue: e.venue,
    fee: e.fee,
    pricingMode: e.pricingMode,
    participationType: e.participationType,
    minTeamSize: e.minTeamSize,
    maxTeamSize: e.maxTeamSize,
    capacity: e.capacity,
    confirmed: confirmedUnits,
    held: Math.max(e.slotsTaken - confirmedUnits, 0),
    remaining,
    prizes: (e.prizes as unknown as Prize[]) ?? [],
    coordinators: (e.coordinators as unknown as Coordinator[]) ?? [],
    faqs: (e.faqs as unknown as Faq[]) ?? [],
    accent: e.accent,
    requiresStudentId: e.requiresStudentId,
    registrationOpen: e.registrationOpen && e.endsAt > new Date(),
  };
}

export class EventService {
  async listPublicEvents() {
    const [events, rows] = await Promise.all([
      prisma.event.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
      }),
      prisma.registration.groupBy({
        by: ["eventId"],
        where: { status: "CONFIRMED" },
        _count: { _all: true },
      }),
    ]);

    const counts = new Map(rows.map((r) => [r.eventId, r._count._all]));
    return events.map((e) => toPublicEvent(e, counts.get(e.id) ?? 0));
  }

  async getPublicEvent(slug: string) {
    const e = await prisma.event.findUnique({ where: { slug } });
    if (!e || !e.isPublished) return null;

    const confirmed = await prisma.registration.count({
      where: { eventId: e.id, status: "CONFIRMED" },
    });
    return toPublicEvent(e, confirmed);
  }

  async getAvailability(slug: string) {
    const e = await prisma.event.findUnique({ where: { slug } });
    if (!e || !e.isPublished) {
      throw new HttpError(404, "Event not found.", "NOT_FOUND");
    }

    const confirmed = await prisma.registration.count({
      where: { eventId: e.id, status: "CONFIRMED" },
    });
    const held = Math.max(e.slotsTaken - confirmed, 0);
    const remaining = e.capacity == null ? null : Math.max(e.capacity - e.slotsTaken, 0);

    return {
      slug: e.slug,
      capacity: e.capacity,
      slotsTaken: e.slotsTaken,
      confirmed,
      held,
      remaining,
      open: e.registrationOpen && e.endsAt > new Date() && (remaining === null || remaining > 0),
    };
  }

  async getPublicStats() {
    const [events, participantsLead, participantsMembers, categories] = await Promise.all([
      prisma.event.count({ where: { isPublished: true } }),
      prisma.registration.count({ where: { status: "CONFIRMED", team: { is: null } } }),
      prisma.teamMember.count({ where: { team: { status: "ACTIVE" } } }),
      prisma.event.groupBy({ by: ["category"], where: { isPublished: true } }),
    ]);

    return {
      events,
      categories: categories.length,
      participants: participantsLead + participantsMembers,
      hackathonTeamLimit: FEST.hackathon.maxTeams,
      firstPrize: FEST.hackathon.firstPrize,
    };
  }

  async createEvent(input: EventInput) {
    const existing = await prisma.event.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new HttpError(409, "An event with this slug already exists.", "SLUG_TAKEN");
    }
    const data = eventInputToData(input);
    const event = await prisma.event.create({
      data: {
        ...data,
        prizes: data.prizes as any,
        coordinators: data.coordinators as any,
        faqs: data.faqs as any,
      },
    });
    return { id: event.id, slug: event.slug };
  }

  async updateEvent(id: string, input: UpdateEventInput) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Event not found.", "NOT_FOUND");

    if (input.slug && input.slug !== existing.slug) {
      const slugClash = await prisma.event.findUnique({ where: { slug: input.slug } });
      if (slugClash && slugClash.id !== id) {
        throw new HttpError(409, "An event with this slug already exists.", "SLUG_TAKEN");
      }
    }

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.category !== undefined) data.category = input.category;
    if (input.tagline !== undefined) data.tagline = input.tagline;
    if (input.description !== undefined) data.description = input.description;
    if (input.eligibility !== undefined) data.eligibility = input.eligibility;
    if (input.startsAt !== undefined) data.startsAt = input.startsAt;
    if (input.endsAt !== undefined) data.endsAt = input.endsAt;
    if (input.venue !== undefined) data.venue = input.venue;
    if (input.fee !== undefined) data.fee = input.fee;
    if (input.pricingMode !== undefined) data.pricingMode = input.pricingMode;
    if (input.participationType !== undefined) {
      data.participationType = input.participationType;
      if (input.participationType === "INDIVIDUAL") {
        data.minTeamSize = 1;
        data.maxTeamSize = 1;
      }
    }
    if (input.minTeamSize !== undefined) data.minTeamSize = input.minTeamSize;
    if (input.maxTeamSize !== undefined) data.maxTeamSize = input.maxTeamSize;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.teamCodePrefix !== undefined) data.teamCodePrefix = input.teamCodePrefix;
    if (input.accent !== undefined) data.accent = input.accent;
    if (input.requiresStudentId !== undefined) data.requiresStudentId = input.requiresStudentId;
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;
    if (input.registrationOpen !== undefined) data.registrationOpen = input.registrationOpen;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    if (input.rulesText !== undefined) data.rules = splitLines(input.rulesText);
    if (input.prizesText !== undefined) data.prizes = parsePrizes(input.prizesText) as any;
    if (input.coordinatorsText !== undefined) data.coordinators = parseCoordinators(input.coordinatorsText) as any;
    if (input.faqsText !== undefined) data.faqs = parseFaqs(input.faqsText) as any;

    const updated = await prisma.event.update({
      where: { id },
      data,
    });
    return { id: updated.id, slug: updated.slug, fee: updated.fee, capacity: updated.capacity };
  }

  async deleteEvent(id: string) {
    const regCount = await prisma.registration.count({ where: { eventId: id } });
    if (regCount > 0) {
      throw new HttpError(400, "Cannot delete an event that has registrations.", "HAS_REGISTRATIONS");
    }
    await prisma.event.delete({ where: { id } });
    return { success: true };
  }
}

export const eventService = new EventService();
