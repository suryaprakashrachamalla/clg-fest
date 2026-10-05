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
      "Architect scalable distributed systems, autonomous AI engines, or decentralized protocols. 24 continuous hours of building, mentorship from senior engineers, and live prototyping.",
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
      "Prototypes will be evaluated on innovation, technical depth, and execution.",
    ],
    specs: ["AI, Cloud & Fullstack", "Open Source", "Live Mentorship"],
  },

  // ── 2. SEMITECHNICAL TRACK: ROBOWARS ARENA ────────────────────────────────
  {
    id: "semitech-robowars",
    slug: "robowars",
    title: "RoboWars Arena",
    category: "SEMITECHNICAL",
    sponsor: "OFFICIAL TRACK · ROBOTICS CLUB",
    domain: "ROBOTICS & EMBEDDED",
    tagline: "Autonomous and combat robotics arena clash.",
    description:
      "Design, engineer, and pilot combat robots in an enclosed steel hazard arena. Compete in 1v1 destruction heats, maze traversal, and weapon agility trials under strict safety guidelines.",
    teamSizeLabel: "Team of up to 4",
    prizePool: "₹30,000",
    perks: "+ Championship Trophy & Hardware Kits",
    status: "OPEN",
    venue: "Mechanical Workshop & Arena",
    date: "17 October 2026",
    time: "Heats start 11:30 AM",
    highlight: "Engineered combat bots battle for supreme kinetic dominance.",
    entryFee: "₹400 / Team",
    rules: [
      "Robots must comply with 15kg or 30kg combat category weight limits.",
      "Active weapon systems and fail-safe kill switches are mandatory.",
      "Matches consist of 3-minute rounds evaluated by jury on aggression, damage, and control.",
    ],
    specs: ["Robotics & IoT", "Combat Arena", "Hardware Engineering"],
  },

  // ── 3. CULTURAL TRACK: BATTLE OF THE BANDS ────────────────────────────────
  {
    id: "cult-battle-bands",
    slug: "battle-of-bands",
    title: "Battle of the Bands",
    category: "CULTURAL",
    sponsor: "OFFICIAL TRACK · CULTURAL COUNCIL",
    domain: "MUSIC & LIVE STAGE",
    tagline: "Live musical showdown & electric acoustic clash.",
    description:
      "The premier stage for collegiate bands to perform rock, fusion, metal, or acoustic covers and original compositions in front of a live crowd of 3,000+ music enthusiasts.",
    teamSizeLabel: "Bands of 3 to 8 members",
    prizePool: "₹35,000",
    perks: "+ Studio Recording Deal & Professional Gear",
    status: "OPEN",
    venue: "MVSR Main Open Air Amphitheatre",
    date: "18 October 2026",
    time: "04:00 PM onwards",
    highlight: "Live musical showdown evaluated on rhythm, tightness, and vocal dynamics.",
    entryFee: "₹500 / Band",
    rules: [
      "Each band gets 15 minutes of stage time including setup and soundcheck.",
      "Standard drum kit, bass amp, and guitar cabinets are provided on stage.",
      "Bands must bring their own instruments, pedals, and drumsticks.",
    ],
    specs: ["Live Music", "Grand Amphitheatre", "Originals & Covers"],
  },
];
