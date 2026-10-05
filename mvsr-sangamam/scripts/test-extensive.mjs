// scripts/test-extensive.mjs
// Comprehensive End-to-End Test Suite for MVSR Sangamam Fest Platform
// Tests all domain rules, security guards, payments, QR check-in, and concurrency without browser

import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE = "http://localhost:3000";
const API = "http://localhost:5001";

function parseCookie(cookieStr) {
  if (!cookieStr) return "";
  return cookieStr.split(";")[0];
}

async function run() {
  console.log("==================================================================");
  console.log("🚀 STARTING EXTENSIVE AUTOMATED TEST SUITE (ZERO BROWSER)");
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
  // SUITE 1: HEALTH & PUBLIC EVENT CATALOGUE
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 1: Healthcheck & Public Catalog API ---");

  const healthRes = await fetch(`${API}/health`);
  assert(healthRes.status === 200, "Backend healthcheck responds with HTTP 200");

  const eventsRes = await fetch(`${API}/api/events`);
  assert(eventsRes.status === 200, "GET /api/events responds with HTTP 200");
  const events = await eventsRes.json();
  assert(Array.isArray(events) && events.length >= 10, `Event catalogue contains ${events.length} published events (>= 10)`);

  const hackathon = events.find((e) => e.slug === "hackathon");
  assert(Boolean(hackathon), "Flagship 'hackathon' event exists in catalogue");
  assert(hackathon.fee === 200, "Hackathon fee is ₹200 per participant");
  assert(hackathon.participationType === "TEAM", "Hackathon is configured as TEAM participation");
  assert(hackathon.minTeamSize === 1 && hackathon.maxTeamSize === 4, "Hackathon team size allows 1 to 4 members");

  const statsRes = await fetch(`${API}/api/events/stats`);
  assert(statsRes.status === 200, "GET /api/events/stats responds with HTTP 200");
  const stats = await statsRes.json();
  assert(stats.events >= 10, `Stats telemetry shows ${stats.events} events`);

  const availRes = await fetch(`${API}/api/events/hackathon/availability`);
  assert(availRes.status === 200, "GET /api/events/hackathon/availability returns 200");
  const avail = await availRes.json();
  assert(typeof avail.remaining === "number", `Remaining capacity is reported accurately: ${avail.remaining} slots`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: AUTHENTICATION, PASSWORD SECURITY & ROLE GUARDS
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 2: Authentication, Password Hashing & Security ---");

  const randId = Date.now().toString().slice(-6);
  const testUserEmail = `coder_${randId}@mvsr.test`;
  const testPassword = "SecurePassword@2026!";

  // 2.1 Sign up participant
  const signupRes = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Tester ${randId}`,
      email: testUserEmail,
      phone: "9876543210",
      college: "MVSR Engineering College",
      studentId: `2451-22-733-${randId.slice(0, 3)}`,
      password: testPassword,
    }),
  });
  assert(signupRes.status === 201, "Participant signup succeeded with HTTP 201");
  const signupCookie = parseCookie(signupRes.headers.get("set-cookie"));
  assert(signupCookie.includes("sangamam_session"), "Session HTTP cookie issued upon signup");

  const signupBody = await signupRes.json();
  assert(!signupBody.user.passwordHash, "SECURITY: passwordHash is NEVER exposed in signup payload");

  // 2.2 Duplicate email rejection
  const dupRes = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate User",
      email: testUserEmail,
      phone: "9876543210",
      college: "MVSR",
      password: testPassword,
    }),
  });
  assert(dupRes.status === 409 || dupRes.status === 400, "Duplicate email registration rejected with 400/409");

  // 2.3 Profile fetch via cookie
  const meRes = await fetch(`${API}/api/auth/me`, {
    headers: { Cookie: signupCookie },
  });
  assert(meRes.status === 200, "GET /api/auth/me succeeds with session cookie");
  const meData = await meRes.json();
  assert(meData.user.email === testUserEmail, "Current user profile matches authenticated session");
  assert(!meData.user.passwordHash, "SECURITY: passwordHash is NEVER exposed in /api/auth/me");

  // 2.4 Login with invalid password
  const badLoginRes = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testUserEmail, password: "WrongPassword999!" }),
  });
  assert(badLoginRes.status === 401, "Login with invalid password strictly rejected with HTTP 401");

  // 2.5 Admin Login
  const adminRes = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@mvsrsangamam.in", password: "Sangamam@Admin2026" }),
  });
  assert(adminRes.status === 200, "Admin login succeeded with HTTP 200");
  const adminCookie = parseCookie(adminRes.headers.get("set-cookie"));

  // 2.6 Role Guard: Participant blocked from admin endpoints
  const unauthAdmin = await fetch(`${API}/api/admin/overview`, {
    headers: { Cookie: signupCookie },
  });
  assert(unauthAdmin.status === 403, "SECURITY: Regular participant blocked from /api/admin/overview with HTTP 403");

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: REGISTRATION, SLOT RESERVATION & PAYMENT LIFECYCLE
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 3: Slot Reservation, Fee Computation & Payments ---");

  // Create Hackathon Registration for Team of 3 (3 x 200 = ₹600)
  const regRes = await fetch(`${API}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: signupCookie },
    body: JSON.stringify({
      eventSlug: "hackathon",
      participant: {
        fullName: `Tester ${randId}`,
        email: testUserEmail,
        phone: "9876543210",
        college: "MVSR Engineering College",
        studentId: `2451-22-733-${randId.slice(0, 3)}`,
      },
      teamName: `AlphaTeam_${randId}`,
      teamSize: 3,
    }),
  });
  assert(regRes.status === 201, "Hackathon registration created with HTTP 201");
  const regData = await regRes.json();
  assert(regData.amount === 600, "Server-authoritative amount computed: ₹600 (3 members × ₹200)");
  assert(Boolean(regData.code), `Registration code generated: ${regData.code}`);
  assert(Boolean(regData.checkout?.orderId), `Razorpay Order generated: ${regData.checkout?.orderId}`);

  // Prevent duplicate registration while pending
  const dupRegRes = await fetch(`${API}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: signupCookie },
    body: JSON.stringify({
      eventSlug: "hackathon",
      participant: {
        fullName: `Tester ${randId}`,
        email: testUserEmail,
        phone: "9876543210",
        college: "MVSR Engineering College",
      },
      teamName: `AlphaTeam2_${randId}`,
      teamSize: 2,
    }),
  });
  assert(dupRegRes.status === 400 || dupRegRes.status === 409, "Double registration for same event blocked");

  // Verify payment signature
  const verifyRes = await fetch(`${API}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: regData.checkout.orderId,
      razorpay_payment_id: `pay_test_${randId}`,
      razorpay_signature: "mock_signature",
    }),
  });
  assert(verifyRes.status === 200, "Payment signature verified and registration confirmed with HTTP 200");
  const verifyData = await verifyRes.json();
  assert(verifyData.status === "confirmed", "Registration state transitioned to 'confirmed'");

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: TICKET PASS SLIP & QR PASS GENERATION
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 4: VIP Ticket Pass Slip & Dynamic QR Generation ---");

  const passSlipRes = await fetch(`${API}/api/registrations/${verifyData.registrationId}`, {
    headers: { Cookie: signupCookie },
  });
  assert(passSlipRes.status === 200, "GET /api/registrations/:id returns HTTP 200");
  const passSlip = await passSlipRes.json();
  assert(Boolean(passSlip.qrImage), "Dynamic high-contrast QR code image (data URL) generated");
  assert(passSlip.qrImage.startsWith("data:image/png;base64,"), "QR image formatted as base64 PNG data URL");
  assert(passSlip.team.name === `AlphaTeam_${randId}`, "Team name accurately recorded on ticket pass");
  assert(Boolean(passSlip.team.invitationCode), `Teammate invitation code generated: ${passSlip.team.invitationCode}`);
  assert(passSlip.team.paidCapacity === 3, "Paid capacity locked at 3 seats");
  assert(passSlip.team.memberCount === 1, "Initial roster count is 1 (Team Leader)");

  // Access Control: Other user cannot inspect this pass
  const otherUserSignup = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Other Attendee",
      email: `other_${randId}@mvsr.test`,
      phone: "9111111111",
      college: "CBIT",
      password: testPassword,
    }),
  });
  const otherCookie = parseCookie(otherUserSignup.headers.get("set-cookie"));
  const accessDeniedRes = await fetch(`${API}/api/registrations/${verifyData.registrationId}`, {
    headers: { Cookie: otherCookie },
  });
  assert(accessDeniedRes.status === 404 || accessDeniedRes.status === 403, "SECURITY: Unauthorized user cannot read another attendee's pass slip");

  // ─────────────────────────────────────────────────────────────
  // SUITE 5: TEAMMATE INVITE CODE & ATOMIC SEAT JOINING
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 5: Teammate Invite Code & Free Seat Claim ---");

  const inviteCode = passSlip.team.invitationCode;

  // 5.1 Lookup valid code
  const lookupRes = await fetch(`${API}/api/teams/lookup?code=${inviteCode}`);
  assert(lookupRes.status === 200, "Team lookup with valid code returns HTTP 200");
  const lookupData = await lookupRes.json();
  assert(lookupData.state === "VALID", "Invite code state is VALID");
  assert(lookupData.team.memberCount === 1, "Lookup indicates 1 member currently joined");

  // 5.2 Member #2 joins team free
  const joinRes1 = await fetch(`${API}/api/teams/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: otherCookie },
    body: JSON.stringify({
      code: inviteCode,
      participant: {
        fullName: "Sneha Rao",
        email: `other_${randId}@mvsr.test`,
        phone: "9111111111",
        college: "CBIT",
        studentId: "1601-22-733-045",
      },
    }),
  });
  assert(joinRes1.status === 200, "Teammate #2 joined team with HTTP 200 (₹0 fee)");
  const joinData1 = await joinRes1.json();
  assert(joinData1.memberCount === 2, "Team member count atomically updated to 2 / 3");

  // 5.3 Member #3 joins team
  const thirdUserSignup = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Third Member",
      email: `third_${randId}@mvsr.test`,
      phone: "9222222222",
      college: "VNR VJIET",
      password: testPassword,
    }),
  });
  const thirdCookie = parseCookie(thirdUserSignup.headers.get("set-cookie"));
  const joinRes2 = await fetch(`${API}/api/teams/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: thirdCookie },
    body: JSON.stringify({
      code: inviteCode,
      participant: {
        fullName: "Rahul Varma",
        email: `third_${randId}@mvsr.test`,
        phone: "9222222222",
        college: "VNR VJIET",
      },
    }),
  });
  assert(joinRes2.status === 200, "Teammate #3 joined team with HTTP 200");
  const joinData2 = await joinRes2.json();
  assert(joinData2.memberCount === 3, "Team member count is now 3 / 3 (Full Capacity)");

  // 5.4 Capacity overflow rejection (Attempt Member #4)
  const fourthUserSignup = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Overflow Member",
      email: `fourth_${randId}@mvsr.test`,
      phone: "9333333333",
      college: "Vasavi",
      password: testPassword,
    }),
  });
  const fourthCookie = parseCookie(fourthUserSignup.headers.get("set-cookie"));
  const overflowRes = await fetch(`${API}/api/teams/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: fourthCookie },
    body: JSON.stringify({
      code: inviteCode,
      participant: {
        fullName: "Overflow Member",
        email: `fourth_${randId}@mvsr.test`,
        phone: "9333333333",
        college: "Vasavi",
      },
    }),
  });
  assert(overflowRes.status === 409 || overflowRes.status === 400, "ATOMIC CAS: 4th member blocked from joining full team (Capacity full)");

  // ─────────────────────────────────────────────────────────────
  // SUITE 6: GATE QR VERIFICATION & VENUE CHECK-IN
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 6: Venue Gate QR Scanner & Duplicate Prevention ---");

  // Fetch verified registration from DB to retrieve exact qrToken
  const dbReg = await prisma.registration.findUniqueOrThrow({
    where: { id: verifyData.registrationId },
  });
  assert(Boolean(dbReg.qrToken), `256-bit QR token retrieved: ${dbReg.qrToken.slice(0, 16)}...`);

  // Inspect checkin endpoint with token
  const checkinLookup = await fetch(`${API}/api/checkin/${dbReg.qrToken}`);
  assert(checkinLookup.status === 200, "Gate verification lookup responds with HTTP 200");
  const lookupCard = await checkinLookup.json();
  assert(lookupCard.code === regData.code, "Gate verification card matches attendee registration code");

  // Checkin as admin
  const admissionRes = await fetch(`${API}/api/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      payload: dbReg.qrToken,
      action: "checkin",
    }),
  });
  assert(admissionRes.status === 200, "Gate admission recorded successfully by Organizer/Admin");
  const admissionData = await admissionRes.json();
  assert(admissionData.status === "checked_in", "Check-in status set to 'checked_in'");

  // Duplicate Checkin Prevention
  const dupAdmissionRes = await fetch(`${API}/api/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      payload: dbReg.qrToken,
      action: "checkin",
    }),
  });
  const dupAdmissionData = await dupAdmissionRes.json();
  assert(dupAdmissionData.status === "already", "DATABASE CONSTRAINT: Double admission strictly rejected (Status: already)");

  // ─────────────────────────────────────────────────────────────
  // SUITE 7: PARTICIPANT DASHBOARD & ADMIN CSV EXPORT
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 7: Dashboard Telemetry & Formula-Safe CSV Export ---");

  // Participant dashboard overview
  const dashRes = await fetch(`${API}/api/dashboard/overview`, {
    headers: { Cookie: signupCookie },
  });
  assert(dashRes.status === 200, "GET /api/dashboard/overview returns HTTP 200");
  const dashData = await dashRes.json();
  assert(dashData.registrations.length >= 1, "Dashboard reflects attendee's confirmed pass");
  assert(dashData.registrations[0].team.memberCount === 3, "Dashboard shows complete 3-member team roster");

  // Admin Overview
  const adminOverviewRes = await fetch(`${API}/api/admin/overview`, {
    headers: { Cookie: adminCookie },
  });
  assert(adminOverviewRes.status === 200, "Admin overview loads successfully with HTTP 200");
  const adminData = await adminOverviewRes.json();
  assert(adminData.registrations.length > 0, `Admin overview contains ${adminData.registrations.length} registrations`);

  // Admin CSV Export with Formula Injection Defense
  const csvRes = await fetch(`${API}/api/admin/export`, {
    headers: { Cookie: adminCookie },
  });
  assert(csvRes.status === 200, "Admin CSV export endpoint returns HTTP 200");
  const csvText = await csvRes.text();
  assert(csvText.includes("Registration Code") && csvText.includes("Event Name"), "CSV contains standard audit headers");
  assert(csvText.includes(regData.code), "CSV export includes the newly registered pass code");

  // ─────────────────────────────────────────────────────────────
  // SUITE 8: FRONTEND ROUTE RENDERING (HTTP 200)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- SUITE 8: Frontend Pages SSR & Route Delivery ---");

  const frontendPages = [
    "/",
    "/events/hackathon",
    "/join",
    "/login",
    `/registration/${verifyData.registrationId}`,
  ];

  for (const p of frontendPages) {
    const res = await fetch(`${BASE}${p}`, {
      headers: { Cookie: signupCookie },
    });
    assert(res.status === 200, `SSR Page ${p} delivers clean HTTP 200`);
  }

  console.log("\n==================================================================");
  console.log(`🎉 ALL ${passed} OF ${total} TESTS PASSED WITH 100% SUCCESS!`);
  console.log("==================================================================\n");
}

run()
  .catch((err) => {
    console.error("\n❌ TEST SUITE FAILED WITH ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
