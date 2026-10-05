/**
 * Fest-wide configuration. Edit this file to change branding, dates, contact details
 * and the fixed ceremony items in the schedule. Events themselves live in the database
 * and are managed from the Admin dashboard (or prisma/seed.mjs for initial data).
 */
export const FEST = {
  name: "MVSR Sangamam",
  shortName: "Sangamam",
  edition: "2026",
  college: "Maturi Venkata Subba Rao (MVSR) Engineering College",
  tagline: "Where code, culture & creativity converge.",
  location: "MVSR Engineering College, Nadergul, Hyderabad",
  locationShort: "Nadergul, Hyderabad",
  mapUrl: "https://maps.google.com/?q=MVSR+Engineering+College+Nadergul",
  // Fest opens 17 Oct 2026, 09:00 IST and closes 18 Oct 2026
  startsAt: "2026-10-17T09:00:00+05:30",
  endsAt: "2026-10-18T19:00:00+05:30",
  dateLabel: "17–18 October 2026",
  days: [
    { key: "2026-10-17", label: "17 Oct", long: "Saturday, 17 October" },
    { key: "2026-10-18", label: "18 Oct", long: "Sunday, 18 October" },
  ],
  hackathon: {
    slug: "hackathon",
    maxTeams: 50,
    pricePerParticipant: 200,
    firstPrize: 20000,
  },
  /** Minutes a slot is held while the participant completes payment. */
  paymentWindowMinutes: 15,
  // TODO(organizers): replace with official contact details before going live.
  contact: {
    email: "sangamam@mvsrec.edu.in",
    phone: "",
    address: "MVSR Engineering College, Nadergul, Balapur (M), Hyderabad, Telangana 501510",
    instagram: "",
  },
  ceremonies: [
    {
      id: "inauguration",
      title: "Inauguration Ceremony",
      day: "2026-10-17",
      time: "09:00",
      venue: "Main Auditorium",
      category: "OTHER",
    },
    {
      id: "closing",
      title: "Closing Ceremony & Prize Distribution",
      day: "2026-10-18",
      time: "17:30",
      venue: "Main Auditorium",
      category: "OTHER",
    },
  ],
} as const;

export const CATEGORIES = [
  { key: "HACKATHON", label: "Hackathon" },
  { key: "TECHNICAL", label: "Technical" },
  { key: "CULTURAL", label: "Cultural" },
  { key: "GAMING", label: "Gaming" },
  { key: "WORKSHOP", label: "Workshops" },
  { key: "OTHER", label: "Other" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
