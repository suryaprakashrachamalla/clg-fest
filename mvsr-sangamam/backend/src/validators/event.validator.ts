import { z } from "zod";

const lines = z.string().max(10000).default("");

export const baseEventObject = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
  category: z.enum(["HACKATHON", "TECHNICAL", "CULTURAL", "GAMING", "WORKSHOP", "OTHER"]),
  tagline: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(5000),
  eligibility: z.string().trim().min(2).max(1000),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  venue: z.string().trim().min(2).max(120),
  fee: z.coerce.number().int().min(0).max(100000),
  pricingMode: z.enum(["PER_PARTICIPANT", "PER_TEAM"]),
  participationType: z.enum(["INDIVIDUAL", "TEAM"]),
  minTeamSize: z.coerce.number().int().min(1).max(20),
  maxTeamSize: z.coerce.number().int().min(1).max(20),
  capacity: z.union([
    z.coerce.number().int().min(1).max(100000),
    z.literal("").transform(() => null),
    z.null(),
  ]),
  teamCodePrefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{2,16}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  accent: z
    .enum([
      "gold",
      "sage",
      "coral",
      "spruce",
      "peacock",
      "arctic",
      "violet",
      "fuchsia",
      "cyan",
      "amber",
      "lime",
      "rose",
    ])
    .default("violet"),
  requiresStudentId: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(true),
  registrationOpen: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(100),
  rulesText: lines,
  prizesText: lines,
  coordinatorsText: lines,
  faqsText: lines,
});

export const eventInputSchema = baseEventObject
  .refine((v) => v.endsAt > v.startsAt, { path: ["endsAt"], message: "Must be after start" })
  .refine((v) => v.maxTeamSize >= v.minTeamSize, {
    path: ["maxTeamSize"],
    message: "Must be ≥ min team size",
  })
  .refine((v) => v.participationType === "TEAM" || v.maxTeamSize === 1, {
    path: ["maxTeamSize"],
    message: "Individual events have team size 1",
  });

export type EventInput = z.infer<typeof eventInputSchema>;

export const updateEventInputSchema = baseEventObject.partial();
export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;

export const splitLines = (s: string) =>
  s
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

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

export function parsePrizes(text: string): Prize[] {
  return splitLines(text).map((l) => {
    const [place, amount, label] = l.split("|").map((x) => x.trim());
    const n = Number(String(amount ?? "").replace(/[^\d]/g, ""));
    return {
      place,
      ...(amount && n ? { amount: n } : {}),
      ...(label ? { label } : !n && amount ? { label: amount } : {}),
    };
  });
}

export function parseCoordinators(text: string): Coordinator[] {
  return splitLines(text).map((l) => {
    const [name, phone, email] = l.split("|").map((x) => x.trim());
    return { name, ...(phone ? { phone } : {}), ...(email ? { email } : {}) };
  });
}

export function parseFaqs(text: string): Faq[] {
  return splitLines(text)
    .map((l) => l.split("::").map((x) => x.trim()))
    .filter(([q, a]) => q && a)
    .map(([q, a]) => ({ q, a }));
}

export function eventInputToData(v: EventInput) {
  return {
    name: v.name,
    slug: v.slug,
    category: v.category,
    tagline: v.tagline,
    description: v.description,
    eligibility: v.eligibility,
    startsAt: v.startsAt,
    endsAt: v.endsAt,
    venue: v.venue,
    fee: v.fee,
    pricingMode: v.pricingMode,
    participationType: v.participationType,
    minTeamSize: v.participationType === "TEAM" ? v.minTeamSize : 1,
    maxTeamSize: v.participationType === "TEAM" ? v.maxTeamSize : 1,
    capacity: v.capacity ?? null,
    teamCodePrefix: v.teamCodePrefix ?? null,
    accent: v.accent,
    requiresStudentId: v.requiresStudentId,
    isPublished: v.isPublished,
    registrationOpen: v.registrationOpen,
    sortOrder: v.sortOrder,
    rules: splitLines(v.rulesText),
    prizes: parsePrizes(v.prizesText),
    coordinators: parseCoordinators(v.coordinatorsText),
    faqs: parseFaqs(v.faqsText),
  };
}
