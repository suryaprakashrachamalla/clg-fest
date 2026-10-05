export interface EventItemData {
  id: string;
  slug: string;
  title: string;
  category: "TECHNICAL" | "SEMITECHNICAL" | "CULTURAL";
  sponsor: string;
  domain: string;
  tagline: string;
  description: string;
  teamSizeLabel: string;
  prizePool: string;
  perks: string;
  status: "OPEN" | "FILLING_FAST" | "CLOSED";
  venue: string;
  date: string;
  time: string;
  highlight: string;
  entryFee: string;
  rules: string[];
  specs: string[];
}

export const ALL_EVENTS_DATA: EventItemData[] = [
  // ── 1. TECHNICAL TRACK: HACKATHON ──────────────────────────────────────────
  {
    id: "tech-hackathon",
    slug: "hackathon",
    title: "National Hackathon",
    category: "TECHNICAL",
    sponsor: "OFFICIAL SPONSOR · MVSR CSE DEPT",
    domain: "AI, CLOUD & SOFTWARE",
    tagline: "An industry-led 24-hour national hackathon.",
    description:
      "Architect scalable distributed systems, autonomous AI engines, or decentralized protocols. 24 continuous hours of building, mentorship from senior engineers, and live prototyping at the CSE Turing Labs.",
    teamSizeLabel: "Solo or team of up to 4",
    prizePool: "₹50,000",
    perks: "+ Direct Interview Fast-Track & Cloud Credits",
    status: "OPEN",
    venue: "CSE Turing Labs (Block C)",
    date: "17–18 October 2026",
    time: "24-hour build phase",
    highlight: "Build a working software prototype that demonstrates real innovation.",
    entryFee: "₹600 / Team",
    rules: [
      "All code must be written within the official 24-hour window.",
      "Projects must be pushed to a public GitHub repository with periodic commits.",
      "Use of open-source frameworks, APIs, and pretrained models is permitted with disclosure.",
      "Prototypes will be evaluated on innovation, technical depth, and execution.",
    ],
    specs: ["AI, Cloud & Fullstack", "Open Source", "Live Mentorship"],
  },

  // ── 2. SEMITECHNICAL / ACOUSTIC TRACK: MUSIC MOB ──────────────────────────
  {
    id: "semitech-music-mob",
    slug: "music-mob",
    title: "Music Mob",
    category: "SEMITECHNICAL",
    sponsor: "OFFICIAL TRACK · SANGAMAM AUDIO & CULTURAL GUILD",
    domain: "LIVE ACOUSTICS & FLASH MOB",
    tagline: "Synchronized collegiate musical flash mob & live instrumental jam.",
    description:
      "Join the most electrifying synchronized musical gathering of Sangamam 2026. Vocalists, instrumentalists, beatboxers, and percussionists converge in a high-octane live acoustic flash mob and collaborative audio showcase across the central plaza.",
    teamSizeLabel: "Solo or groups of up to 6",
    prizePool: "₹25,000",
    perks: "+ Featured Stage Performance & Sound Studio Pass",
    status: "OPEN",
    venue: "Central Amphitheatre & Quadrangle",
    date: "17 October 2026",
    time: "04:30 PM onwards",
    highlight: "High-energy synchronized musical flash mob and live collaborative jam.",
    entryFee: "₹300 / Entry",
    rules: [
      "Open to individual vocalists, instrumentalists, beatboxers, and acoustic groups.",
      "Performance coordinates and synchronization tracks will be shared prior to the mob.",
      "Acoustic and portable instruments welcome (guitars, violins, cajons, keyboards).",
      "Evaluated on synchronicity, rhythm, energy, and crowd engagement.",
    ],
    specs: ["Live Music", "Flash Mob", "Acoustic Jam"],
  },

  // ── 3. CULTURAL TRACK: COMEDY NIGHT ───────────────────────────────────────
  {
    id: "cult-comedy-night",
    slug: "comedy-night",
    title: "Comedy Night",
    category: "CULTURAL",
    sponsor: "OFFICIAL TRACK · SANGAMAM ENTERTAINMENT",
    domain: "STAND-UP COMEDY & HUMOR STAGE",
    tagline: "An evening of unfiltered laughter, sharp wit & stand-up brilliance.",
    description:
      "Take the mic or take a seat for the premier comedy showcase of Sangamam 2026. Featuring open-mic rounds, student stand-up showdowns, and a headline performance by prominent stand-up comedians under the festival lights.",
    teamSizeLabel: "Individual Stand-Up",
    prizePool: "₹30,000",
    perks: "+ Stand-Up Special Slot & Fest Headliner Opening Act",
    status: "OPEN",
    venue: "MVSR Main Open Air Amphitheatre",
    date: "18 October 2026",
    time: "06:00 PM onwards",
    highlight: "Stand-up comedy showdown evaluated on comic timing, originality, and stage presence.",
    entryFee: "₹200 / Participant",
    rules: [
      "Individual stand-up comedians get 5 to 7 minutes of stage time.",
      "Original material only — plagiarism of jokes from specials or social media results in immediate disqualification.",
      "Microphones and professional stage audio provided.",
      "Evaluated by guest judges on punchline delivery, timing, crowd work, and originality.",
    ],
    specs: ["Stand-Up Comedy", "Live Stage", "Open Mic & Showcase"],
  },
];
