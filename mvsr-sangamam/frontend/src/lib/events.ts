import { fetchPublicEvents, fetchPublicStats, fetchPublicEvent } from "../services/api";

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
  confirmed: number;
  held: number;
  remaining: number | null;
  prizes: Prize[];
  coordinators: Coordinator[];
  faqs: Faq[];
  accent: string;
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
    startsAt: "2026-10-17T10:00:00+05:30",
    endsAt: "2026-10-18T10:00:00+05:30",
    venue: "CSE Turing Labs (Block C)",
    fee: 60000,
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
    id: "semitech-robowars",
    slug: "robowars",
    name: "RoboWars Arena",
    category: "SEMITECHNICAL",
    tagline: "Autonomous and combat robotics arena clash.",
    description:
      "Step into the steel-enclosed hazard arena. Design and pilot combat robots equipped with active spinners, flippers, and wedge armor. Compete in 1v1 destruction heats, maze navigation, and endurance trials under strict engineering regulations.",
    rules: [
      "Robots must comply with the 15kg or 30kg combat category weight limits.",
      "Active weapon systems and fail-safe kill switches are mandatory.",
      "Radio control must operate on 2.4 GHz spread-spectrum modulation without frequency overlap.",
      "Matches consist of 3-minute rounds evaluated by jury on aggression, damage, and control.",
    ],
    eligibility:
      "Open to student teams from robotics clubs, mechanical, electrical, and CSE departments.",
    startsAt: "2026-10-17T11:30:00+05:30",
    endsAt: "2026-10-17T18:00:00+05:30",
    venue: "Mechanical Workshop & Arena (Grounds)",
    fee: 40000,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 2,
    maxTeamSize: 4,
    capacity: 32,
    confirmed: 14,
    held: 0,
    remaining: 18,
    prizes: [
      { place: "Arena Champion", amount: 18000, label: "₹18,000 Cash + Championship Trophy" },
      { place: "Runner-Up", amount: 12000, label: "₹12,000 Cash + Hardware Component Kits" },
    ],
    coordinators: [
      { name: "Dr. P. Venkatesh (Faculty Lead)", phone: "+91 98480 55123", email: "venkatesh.mech@mvsrec.edu.in" },
      { name: "Aditya Verma (Robotics Lead)", phone: "+91 97000 88990", email: "robowars@sangamam.in" },
    ],
    faqs: [
      {
        q: "Are pneumatic systems allowed?",
        a: "Yes, pneumatic systems operating under 100 PSI with certified pressure relief valves are allowed.",
      },
    ],
    accent: "sage",
    requiresStudentId: true,
    registrationOpen: true,
  },
  {
    id: "cult-battle-bands",
    slug: "battle-of-bands",
    name: "Battle of the Bands",
    category: "CULTURAL",
    tagline: "Live musical showdown & electric acoustic clash.",
    description:
      "The premier musical competition of Sangamam 2026. College bands battle live on the grand amphitheatre stage with full professional sound equipment, lighting arrays, and an audience of thousands. Covers and original tracks welcome across rock, fusion, metal, and acoustic genres.",
    rules: [
      "Each band gets 15 minutes of stage time including setup and soundcheck.",
      "Standard 5-piece drum kit, bass amp, and guitar cabinets are provided by the festival.",
      "Bands must bring their own instruments, pedals, and drumsticks.",
      "Judged by professional musicians on rhythm, tightness, vocal dynamics, and stage presence.",
    ],
    eligibility: "Open to all verified college and university music bands.",
    startsAt: "2026-10-18T16:00:00+05:30",
    endsAt: "2026-10-18T21:30:00+05:30",
    venue: "MVSR Main Open Air Amphitheatre",
    fee: 50000,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 3,
    maxTeamSize: 8,
    capacity: 20,
    confirmed: 9,
    held: 0,
    remaining: 11,
    prizes: [
      { place: "1st Place Best Band", amount: 20000, label: "₹20,000 Cash + Studio Recording Deal" },
      { place: "2nd Place Runner-Up", amount: 15000, label: "₹15,000 Cash + Professional Audio Gear" },
    ],
    coordinators: [
      { name: "Siddharth Rao (Cultural Convener)", phone: "+91 99887 76655", email: "music@sangamam.in" },
    ],
    faqs: [
      {
        q: "Can we perform original songs?",
        a: "Yes! Original compositions receive bonus evaluation scores from the jury.",
      },
    ],
    accent: "coral",
    requiresStudentId: true,
    registrationOpen: true,
  },
];

export async function listPublicEvents(): Promise<PublicEvent[]> {
  try {
    const remote = await fetchPublicEvents();
    if (remote && remote.length > 0) return remote;
  } catch {}
  return FLAGSHIP_EVENTS;
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  try {
    const remote = await fetchPublicEvent(slug);
    if (remote) return remote;
  } catch {}
  const match = FLAGSHIP_EVENTS.find((e) => e.slug === slug || e.slug.includes(slug) || slug.includes(e.slug));
  return match ?? null;
}

export async function publicStats() {
  try {
    const stats = await fetchPublicStats();
    if (stats) return stats;
  } catch {}
  return {
    events: 3,
    categories: 3,
    participants: 1250,
    hackathonTeamLimit: 50,
    firstPrize: 25000,
  };
}
