export interface Prize {
  place: string;
  amount?: number;
  label?: string;
}

export interface Coordinator {
  name: string;
  phone?: string;
  email?: string;
}

export interface Faq {
  q: string;
  a: string;
}

/** Inverse of eventInputToData, for pre-filling the admin edit form. */
export function eventToFormValues(e: any) {
  const prizes = (e.prizes as Prize[]) ?? [];
  const coords = (e.coordinators as Coordinator[]) ?? [];
  const faqs = (e.faqs as Faq[]) ?? [];
  return {
    name: e.name,
    slug: e.slug,
    category: e.category,
    tagline: e.tagline,
    description: e.description,
    eligibility: e.eligibility,
    startsAt: new Date(e.startsAt).toISOString(),
    endsAt: new Date(e.endsAt).toISOString(),
    venue: e.venue,
    fee: e.fee,
    pricingMode: e.pricingMode,
    participationType: e.participationType,
    minTeamSize: e.minTeamSize,
    maxTeamSize: e.maxTeamSize,
    capacity: e.capacity ?? "",
    teamCodePrefix: e.teamCodePrefix ?? "",
    accent: e.accent,
    requiresStudentId: e.requiresStudentId,
    isPublished: e.isPublished,
    registrationOpen: e.registrationOpen,
    sortOrder: e.sortOrder,
    rulesText: (e.rules || []).join("\n"),
    prizesText: prizes
      .map((p) => [p.place, p.amount ?? "", p.label ?? ""].join(" | ").replace(/( \| )+$/, ""))
      .join("\n"),
    coordinatorsText: coords
      .map((c) => [c.name, c.phone ?? "", c.email ?? ""].join(" | ").replace(/( \| )+$/, ""))
      .join("\n"),
    faqsText: faqs.map((f) => `${f.q} :: ${f.a}`).join("\n"),
  };
}

export type EventFormValues = ReturnType<typeof eventToFormValues>;
