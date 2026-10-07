import { fetchPublicEvent, fetchPublicEvents } from "@/services/api";

export interface PublicEvent {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  rules: string[];
  eligibility: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  fee: number;
  pricingMode: "PER_PARTICIPANT" | "PER_TEAM";
  participationType: "INDIVIDUAL" | "TEAM";
  minTeamSize: number;
  maxTeamSize: number;
  capacity: number | null;
  remaining: number | null;
  prizes: { place: string; amount?: number; label?: string }[];
  coordinators: { name: string; phone?: string; email?: string }[];
  faqs: { q: string; a: string }[];
  requiresStudentId: boolean;
  registrationOpen: boolean;
}

export type EventGroup = "technical" | "semitechnical" | "cultural";

export const EVENT_GROUPS: { key: EventGroup; label: string; blurb: string }[] = [
  { key: "technical", label: "Technical", blurb: "Hackathon, coding, quizzes and workshops." },
  { key: "semitechnical", label: "Semitechnical", blurb: "Part skill, part fun: gaming, hunts and jams." },
  { key: "cultural", label: "Cultural", blurb: "Music, dance and comedy on the main stage." },
];

/**
 * The backend stores finer categories (HACKATHON, TECHNICAL, GAMING, ...).
 * The site shows three groups; this table decides which group each event lands in.
 * Slug overrides win over the category mapping.
 */
const SLUG_GROUP: Record<string, EventGroup> = {
  "music-mob": "semitechnical",
};
const CATEGORY_GROUP: Record<string, EventGroup> = {
  HACKATHON: "technical",
  TECHNICAL: "technical",
  WORKSHOP: "technical",
  GAMING: "semitechnical",
  OTHER: "semitechnical",
  SEMITECHNICAL: "semitechnical",
  CULTURAL: "cultural",
};

export function groupOf(e: { slug: string; category: string }): EventGroup {
  return SLUG_GROUP[e.slug] ?? CATEGORY_GROUP[e.category] ?? "semitechnical";
}

export function groupLabel(e: { slug: string; category: string }) {
  return EVENT_GROUPS.find((g) => g.key === groupOf(e))!.label;
}

export async function listEvents(): Promise<PublicEvent[]> {
  return (await fetchPublicEvents()) as PublicEvent[];
}

export async function getEvent(slug: string): Promise<PublicEvent | null> {
  return (await fetchPublicEvent(slug)) as PublicEvent | null;
}
