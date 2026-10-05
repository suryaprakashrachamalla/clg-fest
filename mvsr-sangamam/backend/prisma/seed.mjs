// Seeds the initial event catalogue and the admin account.
// Idempotent: existing events (matched by slug) are NOT overwritten, so admin edits are safe.
// NOTE(organizers): fees/venues/times for non-hackathon events are initial placeholders —
// adjust them from the Admin → Events screen.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "node:fs";

// Minimal .env loader (avoids an extra dependency)
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const prisma = new PrismaClient();
const t = (d, hm) => new Date(`2026-10-${d}T${hm}:00+05:30`);
const TBA = [{ place: "Winners", label: "Exciting prizes & certificates — to be announced" }];

const events = [
  {
    slug: "hackathon",
    name: "Sangamam Hackathon",
    category: "HACKATHON",
    tagline: "24 hours. 50 teams. Build something that matters.",
    description:
      "The flagship event of MVSR Sangamam. Form a team, pick a problem statement, and ship a working prototype in 24 hours. Mentors from industry and academia will be around through the night to help you go from idea to demo.",
    rules: [
      "Teams of 1 to 4 participants. One team leader registers and pays for the whole team.",
      "Registration fee is ₹200 per participant (team size × ₹200).",
      "Problem statements are revealed at the opening of the hackathon.",
      "All code must be written during the hackathon. Open-source libraries and APIs are allowed.",
      "Bring your own laptops and chargers. Wi-Fi and power will be provided.",
      "Projects are judged on innovation, technical depth, design and presentation.",
      "The organizers' decision is final.",
    ],
    eligibility: "Open to all undergraduate and postgraduate students with a valid college ID.",
    startsAt: t(17, "10:00"),
    endsAt: t(18, "10:00"),
    venue: "CSE Block — Innovation Labs",
    fee: 200,
    pricingMode: "PER_PARTICIPANT",
    participationType: "TEAM",
    minTeamSize: 1,
    maxTeamSize: 4,
    capacity: 50,
    teamCodePrefix: "HACK-2026",
    requiresStudentId: true,
    accent: "violet",
    sortOrder: 1,
    prizes: [
      { place: "1st Prize", amount: 20000, label: "Cash prize" },
      { place: "Runners-up", label: "Prizes to be announced" },
    ],
    faqs: [
      { q: "Do all team members need to pay separately?", a: "No. The team leader pays ₹200 × team size once. Members join free using the invitation code." },
      { q: "Can I change my team size later?", a: "Paid capacity is fixed at registration. Choose the number of members you plan to bring." },
      { q: "Is food provided?", a: "Yes, meals and refreshments are provided to registered participants during the hackathon." },
    ],
  },
  {
    slug: "code-sprint",
    name: "Code Sprint",
    category: "TECHNICAL",
    tagline: "Competitive programming under pressure.",
    description: "A two-hour algorithmic contest. Solve as many problems as you can, as fast as you can. Languages: C, C++, Java, Python.",
    rules: ["Individual participation.", "Plagiarism leads to disqualification.", "Ranking by problems solved, then penalty time."],
    eligibility: "Open to all students.",
    startsAt: t(17, "11:00"),
    endsAt: t(17, "13:00"),
    venue: "IT Block — Lab 2",
    fee: 100,
    participationType: "INDIVIDUAL",
    capacity: 120,
    accent: "cyan",
    sortOrder: 10,
  },
  {
    slug: "tech-quiz",
    name: "Byte Quiz",
    category: "TECHNICAL",
    tagline: "From silicon to startups — test your tech trivia.",
    description: "A fast-paced quiz across computing history, current tech, startups and science. Prelims followed by a stage final.",
    rules: ["Teams of 2.", "No phones during rounds.", "Quizmaster's decision is final."],
    eligibility: "Open to all students.",
    startsAt: t(17, "14:00"),
    endsAt: t(17, "16:00"),
    venue: "Seminar Hall 1",
    fee: 100,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 2,
    maxTeamSize: 2,
    capacity: 60,
    teamCodePrefix: "QUIZ-2026",
    accent: "amber",
    sortOrder: 11,
  },
  {
    slug: "project-expo",
    name: "Project Expo",
    category: "TECHNICAL",
    tagline: "Showcase what you've built.",
    description: "Display your hardware or software project to a jury of faculty and industry guests.",
    rules: ["Teams of 1–3.", "Bring your own setup; power points are provided.", "5-minute demo + Q&A."],
    eligibility: "Open to all students.",
    startsAt: t(18, "10:00"),
    endsAt: t(18, "13:00"),
    venue: "ECE Block — Exhibition Hall",
    fee: 150,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 1,
    maxTeamSize: 3,
    capacity: 40,
    teamCodePrefix: "EXPO-2026",
    accent: "lime",
    sortOrder: 12,
  },
  {
    slug: "robo-race",
    name: "Robo Race",
    category: "TECHNICAL",
    tagline: "Build it. Drive it. Win it.",
    description: "Race your manually controlled bot through an obstacle track in the shortest time.",
    rules: ["Teams of 2–4.", "Bot dimensions max 30×30×30 cm.", "Wired or wireless control allowed."],
    eligibility: "Open to all students.",
    startsAt: t(18, "11:00"),
    endsAt: t(18, "14:00"),
    venue: "Mechanical Block — Arena",
    fee: 300,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 2,
    maxTeamSize: 4,
    capacity: 30,
    teamCodePrefix: "ROBO-2026",
    accent: "rose",
    sortOrder: 13,
  },
  {
    slug: "battle-of-bands",
    name: "Battle of Bands",
    category: "CULTURAL",
    tagline: "Turn it up to eleven.",
    description: "Live band competition on the main stage. Original compositions earn bonus points.",
    rules: ["Bands of 3–8 members.", "15 minutes per band including setup.", "Drum kit and amps provided."],
    eligibility: "Open to all students.",
    startsAt: t(17, "18:00"),
    endsAt: t(17, "21:00"),
    venue: "Open Air Theatre",
    fee: 500,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 3,
    maxTeamSize: 8,
    capacity: 12,
    teamCodePrefix: "BAND-2026",
    accent: "fuchsia",
    sortOrder: 20,
  },
  {
    slug: "solo-dance",
    name: "Footloose — Solo Dance",
    category: "CULTURAL",
    tagline: "Own the stage.",
    description: "Solo dance competition — any style. Bring your track on a pen drive.",
    rules: ["Individual.", "Performance time 3–4 minutes.", "No hazardous props."],
    eligibility: "Open to all students.",
    startsAt: t(18, "14:00"),
    endsAt: t(18, "16:30"),
    venue: "Main Auditorium",
    fee: 150,
    participationType: "INDIVIDUAL",
    capacity: 40,
    accent: "fuchsia",
    sortOrder: 21,
  },
  {
    slug: "bgmi-showdown",
    name: "BGMI Showdown",
    category: "GAMING",
    tagline: "Squad up. Drop in. Chicken dinner.",
    description: "Squad-based BGMI tournament with league rounds and a stage final.",
    rules: ["Squads of 4.", "Bring your own device and earphones.", "Emulators are not allowed."],
    eligibility: "Open to all students.",
    startsAt: t(17, "14:00"),
    endsAt: t(17, "18:00"),
    venue: "Gaming Arena — Block C",
    fee: 400,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 4,
    maxTeamSize: 4,
    capacity: 32,
    teamCodePrefix: "BGMI-2026",
    accent: "amber",
    sortOrder: 30,
  },
  {
    slug: "valorant-cup",
    name: "Valorant Cup",
    category: "GAMING",
    tagline: "5v5 tactical shooter tournament.",
    description: "Single-elimination Valorant tournament on LAN.",
    rules: ["Teams of 5.", "Riot accounts must be level 20+.", "Standard competitive rules."],
    eligibility: "Open to all students.",
    startsAt: t(18, "10:00"),
    endsAt: t(18, "15:00"),
    venue: "Gaming Arena — Block C",
    fee: 500,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 5,
    maxTeamSize: 5,
    capacity: 16,
    teamCodePrefix: "VAL-2026",
    accent: "rose",
    sortOrder: 31,
  },
  {
    slug: "genai-workshop",
    name: "GenAI Builders Workshop",
    category: "WORKSHOP",
    tagline: "Hands-on with LLMs, agents and RAG.",
    description: "A practical workshop on building applications with large language models: prompting, retrieval-augmented generation and simple agents.",
    rules: ["Bring a laptop with Python installed.", "Certificate of participation provided."],
    eligibility: "Open to all students. Basic Python knowledge recommended.",
    startsAt: t(17, "14:00"),
    endsAt: t(17, "17:00"),
    venue: "CSE Block — Seminar Hall",
    fee: 150,
    participationType: "INDIVIDUAL",
    capacity: 60,
    accent: "cyan",
    sortOrder: 40,
    prizes: [],
  },
  {
    slug: "treasure-hunt",
    name: "Campus Treasure Hunt",
    category: "OTHER",
    tagline: "Decode clues across the campus.",
    description: "Solve riddles and follow clues hidden across the MVSR campus. First team to the treasure wins.",
    rules: ["Teams of 2–4.", "Stay within campus limits.", "No vehicles."],
    eligibility: "Open to all students.",
    startsAt: t(18, "12:00"),
    endsAt: t(18, "14:00"),
    venue: "Starts at Main Gate Plaza",
    fee: 200,
    pricingMode: "PER_TEAM",
    participationType: "TEAM",
    minTeamSize: 2,
    maxTeamSize: 4,
    capacity: 40,
    teamCodePrefix: "HUNT-2026",
    accent: "lime",
    sortOrder: 50,
  },
];

async function main() {
  for (const e of events) {
    const data = {
      pricingMode: "PER_PARTICIPANT",
      minTeamSize: 1,
      maxTeamSize: 1,
      prizes: TBA,
      coordinators: [],
      faqs: [],
      ...e,
    };
    await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: data });
  }
  console.log(`✓ ${events.length} events ensured`);

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && password.length >= 8) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", passwordHash },
      create: { email, passwordHash, name: "Sangamam Admin", phone: "9000000000", college: "MVSR Engineering College", role: "ADMIN" },
    });
    console.log(`✓ admin account: ${email}`);
  } else {
    console.log("! ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
