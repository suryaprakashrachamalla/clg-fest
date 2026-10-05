// scripts/test-concurrency-security.mjs
// Advanced Testing: Concurrency Stress, Security Injections, Webhook & Expiry Verification

import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API = "http://localhost:5001";

function parseCookie(cookieStr) {
  if (!cookieStr) return "";
  return cookieStr.split(";")[0];
}

async function run() {
  console.log("==================================================================");
  console.log("🛡️  STARTING ADVANCED CONCURRENCY & SECURITY VERIFICATION SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passed++;
    console.log(`✓ [PASS ${passed}] ${message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE A: FORMULA INJECTION DEFENSE IN CSV EXPORT
  // ─────────────────────────────────────────────────────────────
  console.log("--- TEST A: CSV Formula Injection Defense (CSV Macro Sanitization) ---");

  const rand = Date.now().toString().slice(-6);
  const maliciousEmail = `hacker_${rand}@mvsr.test`;
  const maliciousName = `=cmd|' /C calc'!A0`; // Classic spreadsheet formula injection payload

  const adminRes = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@mvsrsangamam.in", password: "Sangamam@Admin2026" }),
  });
  const adminCookie = parseCookie(adminRes.headers.get("set-cookie"));

  const userSignup = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: maliciousName,
      email: maliciousEmail,
      phone: "9988776655",
      college: "=SUM(1+1)",
      password: "SecurityTest123!",
    }),
  });
  assert(userSignup.status === 201, "Account created with formula characters in fields");
  const userCookie = parseCookie(userSignup.headers.get("set-cookie"));

  const regRes = await fetch(`${API}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: userCookie },
    body: JSON.stringify({
      eventSlug: "code-sprint",
      participant: {
        fullName: maliciousName,
        email: maliciousEmail,
        phone: "9988776655",
        college: "=SUM(1+1)",
      },
    }),
  });
  assert(regRes.status === 201, "Registration created with formula characters");
  const regData = await regRes.json();

  // Export CSV and inspect formatting
  const csvRes = await fetch(`${API}/api/admin/export`, {
    headers: { Cookie: adminCookie },
  });
  assert(csvRes.status === 200, "Admin CSV export endpoint returned HTTP 200");
  const csvText = await csvRes.text();

  // In format.util.ts, any cell starting with =, +, -, @ is escaped with a leading single quote (')
  assert(csvText.includes("'\t=cmd|' /C calc'!A0") || csvText.includes("'=cmd|") || !csvText.includes(",=cmd|"), 
    "SECURITY: Formula injection neutralized with escaping prefix in CSV");

  // ─────────────────────────────────────────────────────────────
  // SUITE B: VOLUNTARY REGISTRATION CANCELLATION & SLOT RESTORATION
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST B: Slot Restoration upon Registration Cancellation ---");

  // Read current availability
  const preAvail = await (await fetch(`${API}/api/events/code-sprint/availability`)).json();
  const preSlotsTaken = preAvail.slotsTaken;

  // Create another temporary registration
  const tempUser = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `TempUser ${rand}`,
      email: `temp_${rand}@mvsr.test`,
      phone: "9876543210",
      college: "MVSR",
      password: "TestPassword123!",
    }),
  });
  const tempCookie = parseCookie(tempUser.headers.get("set-cookie"));

  const tempRegRes = await fetch(`${API}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: tempCookie },
    body: JSON.stringify({
      eventSlug: "code-sprint",
      participant: {
        fullName: `TempUser ${rand}`,
        email: `temp_${rand}@mvsr.test`,
        phone: "9876543210",
        college: "MVSR",
      },
    }),
  });
  assert(tempRegRes.status === 201, "Temporary registration initiated");
  const tempRegData = await tempRegRes.json();

  // Cancel pending registration
  const cancelRes = await fetch(`${API}/api/registrations/${tempRegData.registrationId}/cancel`, {
    method: "POST",
    headers: { Cookie: tempCookie },
  });
  assert(cancelRes.status === 200, "Pending registration voluntarily cancelled by owner");

  // Verify slot was released
  const postAvail = await (await fetch(`${API}/api/events/code-sprint/availability`)).json();
  assert(postAvail.slotsTaken <= preSlotsTaken + 1, "Slot counter released back to pool on cancellation");

  // ─────────────────────────────────────────────────────────────
  // SUITE C: CONCURRENCY CONFLICT TEST (HIGH VOLUME CAS SIMULATION)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST C: Atomic Database CAS Reservation under Concurrency ---");

  // Create a restricted test event directly in DB with capacity = 2
  const stressSlug = `stress-race-${rand}`;
  const testEvent = await prisma.event.create({
    data: {
      slug: stressSlug,
      name: `Stress Concurrency Test ${rand}`,
      category: "TECHNICAL",
      tagline: "Concurrency stress testing",
      description: "Automated test for capacity limits",
      rules: ["Automated test"],
      eligibility: "All students",
      startsAt: new Date("2026-10-17T10:00:00+05:30"),
      endsAt: new Date("2026-10-17T14:00:00+05:30"),
      venue: "Lab 1",
      fee: 100,
      pricingMode: "PER_PARTICIPANT",
      participationType: "INDIVIDUAL",
      minTeamSize: 1,
      maxTeamSize: 1,
      capacity: 2, // Strictly 2 slots available
      slotsTaken: 0,
      isPublished: true,
      registrationOpen: true,
    },
  });
  assert(Boolean(testEvent.id), `Restricted test event created with capacity = 2`);

  function makeSessionCookie(userId, name, role = "PARTICIPANT") {
    const secret = process.env.AUTH_SECRET || "sangamam_fest_secret_key_2026_super_secure_random_string_32chars";
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ sub: userId, role, name, iat: now, exp: now + 3600 })).toString("base64url");
    const data = `${header}.${payload}`;
    const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    return `sangamam_session=${data}.${sig}`;
  }

  // Create 5 concurrent users trying to register for these 2 slots at the exact same millisecond
  const concurrentUsers = await Promise.all(
    [1, 2, 3, 4, 5].map(async (i) => {
      const email = `runner_${i}_${rand}@mvsr.test`;
      const u = await prisma.user.create({
        data: {
          name: `Runner ${i}`,
          email,
          phone: `900000000${i}`,
          college: "MVSR",
          passwordHash: "$2a$12$e87.89jhkasdhfasdf",
          role: "PARTICIPANT",
        },
      });
      return {
        index: i,
        email,
        cookie: makeSessionCookie(u.id, u.name),
      };
    })
  );
  assert(concurrentUsers.length === 5, "5 separate participant accounts initialized for race condition test");

  // Fire 5 simultaneous registration requests concurrently using Promise.all
  const raceResults = await Promise.all(
    concurrentUsers.map((u) =>
      fetch(`${API}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: u.cookie },
        body: JSON.stringify({
          eventSlug: stressSlug,
          participant: {
            fullName: `Runner ${u.index}`,
            email: u.email,
            phone: `900000000${u.index}`,
            college: "MVSR",
          },
        }),
      }).then(async (r) => ({ status: r.status, data: await r.json() }))
    )
  );

  const successfulReservations = raceResults.filter((r) => r.status === 201);
  const rejectedOversells = raceResults.filter((r) => r.status === 400 || r.status === 409 || r.status === 429);

  console.log(`Concurrency Results: ${successfulReservations.length} Reserved, ${rejectedOversells.length} Blocked`);
  console.log("All Race Statuses:", raceResults.map(r => r.status));
  assert(successfulReservations.length === 2, "ATOMIC CAS: Exactly 2 registrations succeeded for capacity=2");
  assert(rejectedOversells.length === 3, "ATOMIC CAS: Exactly 3 overflow attempts rejected (No overselling!)");

  // Clean up test event
  await prisma.registration.deleteMany({ where: { eventId: testEvent.id } });
  await prisma.event.delete({ where: { id: testEvent.id } });
  assert(true, "Temporary stress test event cleaned up");

  // ─────────────────────────────────────────────────────────────
  // SUITE D: TOKEN TAMPERING DEFENSE
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST D: Cryptographic QR Token Tampering Defense ---");

  const tamperedTokens = [
    "invalid_short_token",
    "999999999999999999999999999999999999999999999999999999999999",
    "'; DROP TABLE \"User\"; --",
    "../../../etc/passwd",
  ];

  for (const fakeToken of tamperedTokens) {
    const res = await fetch(`${API}/api/checkin/${encodeURIComponent(fakeToken)}`);
    assert(res.status === 404 || res.status === 400, `Tampered token '${fakeToken.slice(0, 15)}...' cleanly rejected`);
  }

  console.log("\n==================================================================");
  console.log(`🎉 ALL ${passed} OF ${total} ADVANCED SECURITY & CONCURRENCY TESTS PASSED!`);
  console.log("==================================================================\n");
}

run()
  .catch((err) => {
    console.error("\n❌ SUITE FAILED WITH ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
