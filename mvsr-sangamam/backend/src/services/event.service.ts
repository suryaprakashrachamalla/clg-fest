import { Event } from "@prisma/client";
import { prisma } from "../db/prisma.client";
import { eventRepository } from "../repositories/event.repository";
import { registrationRepository } from "../repositories/registration.repository";
import { FEST } from "../config/fest.config";
import { EventInput, eventInputToData, Prize, Coordinator, Faq } from "../validators/event.validator";
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
      eventRepository.findPublished(),
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
    const e = await eventRepository.findBySlug(slug);
    if (!e || !e.isPublished) return null;

    const confirmed = await registrationRepository.count({
      eventId: e.id,
      status: "CONFIRMED",
    });
    return toPublicEvent(e, confirmed);
  }

  async getAvailability(slug: string) {
    const e = await eventRepository.findBySlug(slug);
    if (!e || !e.isPublished) {
      throw new HttpError(404, "Event not found.", "NOT_FOUND");
    }

    const confirmed = await registrationRepository.count({
      eventId: e.id,
      status: "CONFIRMED",
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
      eventRepository.countPublished(),
      registrationRepository.count({ status: "CONFIRMED", team: { is: null } }),
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
    const existing = await eventRepository.findBySlug(input.slug);
    if (existing) {
      throw new HttpError(409, "An event with this slug already exists.", "SLUG_TAKEN");
    }
    const data = eventInputToData(input);
    const event = await eventRepository.create({
      ...data,
      prizes: data.prizes as any,
      coordinators: data.coordinators as any,
      faqs: data.faqs as any,
    });
    return { id: event.id, slug: event.slug };
  }

  async updateEvent(id: string, input: EventInput) {
    const existing = await eventRepository.findById(id);
    if (!existing) throw new HttpError(404, "Event not found.", "NOT_FOUND");

    if (input.slug !== existing.slug) {
      const slugClash = await eventRepository.findBySlug(input.slug);
      if (slugClash && slugClash.id !== id) {
        throw new HttpError(409, "An event with this slug already exists.", "SLUG_TAKEN");
      }
    }

    const data = eventInputToData(input);
    const updated = await eventRepository.update(id, {
      ...data,
      prizes: data.prizes as any,
      coordinators: data.coordinators as any,
      faqs: data.faqs as any,
    });
    return { id: updated.id, slug: updated.slug };
  }

  async deleteEvent(id: string) {
    const regCount = await registrationRepository.count({ eventId: id });
    if (regCount > 0) {
      throw new HttpError(400, "Cannot delete an event that has registrations.", "HAS_REGISTRATIONS");
    }
    await eventRepository.delete(id);
    return { success: true };
  }
}

export const eventService = new EventService();
