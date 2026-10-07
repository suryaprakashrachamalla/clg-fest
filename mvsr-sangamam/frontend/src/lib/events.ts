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

export const FLAGSHIP_EVENTS: PublicEvent[] = [
  {
    id: "tech-hackathon",
    slug: "hackathon",
    name: "National Hackathon 2026",
    category: "TECHNICAL",
    tagline: "An industry-led 24-hour national hackathon.",
    description:
      "Architect scalable distributed applications, autonomous AI agents, cloud architectures, or decentralized smart protocols. 24 continuous hours of building, real-time mentorship from industry engineers, and live prototyping at the CSE Turing Labs.",
    rules: [
      "All code must be written within the official 24-hour window.",
      "Teams must maintain a public GitHub repository with periodic commits during the sprint.",
      "Use of open-source frameworks, APIs, and pretrained models is permitted with proper disclosure.",
      "Hardware prototypes and software demos will be evaluated by an industry jury on innovation, feasibility, and technical depth.",
    ],
    eligibility:
      "Open to all undergraduate & postgraduate students from engineering and degree colleges across India. Valid student ID required.",
    startsAt: "2026-10-16T10:00:00+05:30",
    endsAt: "2026-10-17T10:00:00+05:30",
    venue: "CSE Turing Labs (Block C)",
    fee: 600,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 2,
    maxTeamSize: 4,
    capacity: 50,
    confirmed: 24,
    held: 0,
    remaining: 26,
    prizes: [
      { place: "1st Place Winner", amount: 25000, label: "₹25,000 Cash + Direct Interview Fast-Track" },
      { place: "2nd Place Runner-Up", amount: 15000, label: "₹15,000 Cash + Cloud Credits" },
      { place: "3rd Place Runner-Up", amount: 10000, label: "₹10,000 Cash + Swag Kits" },
    ],
    coordinators: [
      { name: "Prof. K. Ramana Rao (Faculty Convener)", phone: "+91 94401 23456", email: "ramana.cse@mvsrec.edu.in" },
      { name: "Rahul Sharma (Student Lead)", phone: "+91 98765 43210", email: "lead.hackathon@sangamam.in" },
    ],
    faqs: [
      {
        q: "Is accommodation provided for outstation teams?",
        a: "Yes, hostel accommodations and refreshments are provided for all registered outstation hackathon participants on campus.",
      },
      {
        q: "Can teams participate remotely?",
        a: "The hackathon is an in-person, on-campus 24-hour event to foster collaboration and live mentorship.",
      },
    ],
    accent: "gold",
    requiresStudentId: true,
    registrationOpen: true,
  },
  {
    id: "semitech-music-mob",
    slug: "music-mob",
    name: "Music Mob",
    category: "SEMITECHNICAL",
    tagline: "Synchronized collegiate musical flash mob & live instrumental jam.",
    description:
      "Join the most electrifying synchronized musical gathering of Sangamam 2026. Vocalists, instrumentalists, beatboxers, and percussionists converge in a high-octane live acoustic flash mob and collaborative audio showcase across the central plaza.",
    rules: [
      "Open to individual vocalists, instrumentalists, beatboxers, and acoustic groups.",
      "Performance coordinates and synchronization tracks will be shared prior to the mob.",
      "Acoustic and portable instruments welcome (guitars, violins, cajons, keyboards).",
      "Evaluated on synchronicity, rhythm, energy, and crowd engagement.",
    ],
    eligibility:
      "Open to all verified college students with a passion for live acoustics, rhythm, or vocal performance.",
    startsAt: "2026-10-16T16:30:00+05:30",
    endsAt: "2026-10-16T19:30:00+05:30",
    venue: "Central Amphitheatre & Quadrangle",
    fee: 300,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 1,
    maxTeamSize: 6,
    capacity: 40,
    confirmed: 18,
    held: 0,
    remaining: 22,
    prizes: [
      { place: "Top Mob Showcase", amount: 15000, label: "₹15,000 Cash + Featured Stage Performance" },
      { place: "Runner-Up Ensemble", amount: 10000, label: "₹10,000 Cash + Professional Audio Gear" },
    ],
    coordinators: [
      { name: "Rahul Deshmukh (Cultural Lead)", phone: "+91 98480 66778", email: "musicmob@sangamam.in" },
      { name: "Ananya Iyer (Music Convener)", phone: "+91 97000 33445", email: "ananya.music@sangamam.in" },
    ],
    faqs: [
      {
        q: "Can I participate as a solo artist?",
        a: "Yes! Solo performers will be grouped into synchronized performance segments during rehearsal.",
      },
    ],
    accent: "sage",
    requiresStudentId: true,
    registrationOpen: true,
  },
  {
    id: "cult-comedy-night",
    slug: "comedy-night",
    name: "Comedy Night",
    category: "CULTURAL",
    tagline: "An evening of unfiltered laughter, sharp wit & stand-up brilliance.",
    description:
      "Take the mic or take a seat for the premier comedy showcase of Sangamam 2026. Featuring open-mic rounds, student stand-up showdowns, and a headline performance by prominent stand-up comedians under the festival lights.",
    rules: [
      "Individual stand-up comedians get 5 to 7 minutes of stage time.",
      "Original material only — plagiarism of jokes from specials or social media results in immediate disqualification.",
      "Microphones and professional stage audio provided.",
      "Evaluated by guest judges on punchline delivery, timing, crowd work, and originality.",
    ],
    eligibility: "Open to all verified college and university students.",
    startsAt: "2026-10-17T18:00:00+05:30",
    endsAt: "2026-10-17T21:30:00+05:30",
    venue: "MVSR Main Open Air Amphitheatre",
    fee: 200,
    pricingMode: "PER_PARTICIPANT",
    participationType: "INDIVIDUAL",
    minTeamSize: 1,
    maxTeamSize: 1,
    capacity: 60,
    confirmed: 28,
    held: 0,
    remaining: 32,
    prizes: [
      { place: "Best Stand-Up Comic", amount: 18000, label: "₹18,000 Cash + Festival Headliner Opening Act" },
      { place: "Runner-Up Comic", amount: 12000, label: "₹12,000 Cash + Swag Kit" },
    ],
    coordinators: [
      { name: "Siddharth Rao (Entertainment Lead)", phone: "+91 99887 76655", email: "comedy@sangamam.in" },
    ],
    faqs: [
      {
        q: "What languages are permitted for stand-up?",
        a: "Performances are welcome in English, Hindi, and Telugu, or bilingual sets.",
      },
    ],
    accent: "coral",
    requiresStudentId: true,
    registrationOpen: true,
  },
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
