// Complete roundtrip test: Register -> Razorpay payment verify -> Get Team ID & Invite code -> Teammate joins for free -> QR check-in
const BASE = "http://localhost:3000";

async function run() {
  console.log("=== COMPREHENSIVE ROUNDTRIP VERIFICATION ===");

  // 1. Leader Sign Up
  const leaderEmail = `leader_roundtrip_${Date.now()}@sangamam.test`;
  const signupRes = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Harshavardhan Rao",
      email: leaderEmail,
      phone: "9123456789",
      college: "MVSR Engineering College",
      studentId: "2451-22-733-101",
      password: "TestPassword123!",
    }),
  });
  const leaderCookie = signupRes.headers.get("set-cookie");
  const leaderUser = (await signupRes.json()).user;
  console.log(`1. Leader Signed Up: ${leaderUser.name} (${leaderUser.id})`);

  // 2. Hackathon Registration for Team of 3 (3 x 200 = ₹600)
  const regRes = await fetch(`${BASE}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: leaderCookie },
    body: JSON.stringify({
      eventSlug: "hackathon",
      participant: {
        fullName: "Harshavardhan Rao",
        email: leaderEmail,
        phone: "9123456789",
        college: "MVSR Engineering College",
        studentId: "2451-22-733-101",
      },
      teamName: `CyberTitans_${Date.now().toString().slice(-4)}`,
      teamSize: 3,
    }),
  });
  const regData = await regRes.json();
  console.log(`2. Registration Created: Code ${regData.code}, Amount ₹${regData.amount}, Order: ${regData.checkout.orderId}`);
  if (regData.amount !== 600) throw new Error("Incorrect calculation, expected ₹600");

  // 3. Complete Razorpay Payment Verification
  const verifyRes = await fetch(`${BASE}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: leaderCookie },
    body: JSON.stringify({
      razorpay_order_id: regData.checkout.orderId,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: "mock_signature",
    }),
  });
  const verifyData = await verifyRes.json();
  console.log(`3. Payment Verified: Status = ${verifyData.status}, RegID = ${verifyData.registrationId}`);
  if (verifyData.status !== "confirmed") throw new Error("Payment verification failed");

  // 4. View Participant Registration Slip
  const slipRes = await fetch(`${BASE}/registration/${regData.registrationId}`, {
    headers: { Cookie: leaderCookie },
  });
  console.log(`4. Registration Confirmation Slip Page: HTTP ${slipRes.status}`);
  if (slipRes.status !== 200) throw new Error("Slip page failed to load");

  // 5. Query Dashboard to inspect Team ID & Invitation Code
  const dashRes = await fetch(`${BASE}/dashboard`, {
    headers: { Cookie: leaderCookie },
  });
  console.log(`5. Participant Dashboard Page: HTTP ${dashRes.status}`);

  // Fetch Team & Invitation details via database or invitation code directly
  // Let's sign up a teammate and join with code
  // In the DB let's find the invitation code for this registration
  // We can query prisma in the script
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const dbReg = await prisma.registration.findUniqueOrThrow({
    where: { id: regData.registrationId },
    include: { team: { include: { invitation: true, members: true } } },
  });

  const team = dbReg.team;
  const inviteCode = team.invitation.code;
  console.log(`6. Team Details from DB: Team ID = ${team.code}, Invitation Code = ${inviteCode}, Members = ${team.memberCount}/${team.paidCapacity}`);

  // 6. Look up Invitation Code via Public API
  const lookupRes = await fetch(`${BASE}/api/teams/lookup?code=${inviteCode}`);
  const lookupData = await lookupRes.json();
  console.log(`7. Invitation Lookup (${inviteCode}): State = ${lookupData.state}, Team Name = ${lookupData.team?.name}, Paid Capacity = ${lookupData.team?.paidCapacity}`);
  if (lookupData.state !== "VALID") throw new Error("Invitation code should be valid");

  // 7. Teammate #2 Signs Up and Joins Free
  const member2Email = `member2_${Date.now()}@sangamam.test`;
  const m2Signup = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Pooja Hegde",
      email: member2Email,
      phone: "9876500002",
      college: "MVSR Engineering College",
      studentId: "2451-22-733-102",
      password: "Password123!",
    }),
  });
  const m2Cookie = m2Signup.headers.get("set-cookie");

  const joinRes = await fetch(`${BASE}/api/teams/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: m2Cookie },
    body: JSON.stringify({
      code: inviteCode,
      participant: {
        fullName: "Pooja Hegde",
        email: member2Email,
        phone: "9876500002",
        college: "MVSR Engineering College",
        studentId: "2451-22-733-102",
      },
    }),
  });
  const joinData = await joinRes.json();
  console.log(`8. Teammate Joined: Team = ${joinData.teamName}, Member Count = ${joinData.memberCount} / ${joinData.paidCapacity}`);
  if (joinData.memberCount !== 2) throw new Error("Member count should be 2");

  // 8. Organizer QR Check-in
  // Login as admin
  const adminLogin = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@mvsrsangamam.in",
      password: "Sangamam@Admin2026",
    }),
  });
  const adminCookie = adminLogin.headers.get("set-cookie");
  console.log(`9. Admin Authenticated: HTTP ${adminLogin.status}`);

  // Venue QR Check-in
  const checkinRes = await fetch(`${BASE}/api/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      payload: dbReg.qrToken,
      action: "checkin",
    }),
  });
  const checkinData = await checkinRes.json();
  console.log(`10. First Venue Check-in: Status = ${checkinData.status}, Checked-in By = ${checkinData.card?.checkIn?.by}`);
  if (checkinData.status !== "checked_in") throw new Error("Check-in should succeed");

  // Duplicate Venue Check-in Prevention
  const dupCheckin = await fetch(`${BASE}/api/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      payload: dbReg.qrToken,
      action: "checkin",
    }),
  });
  const dupData = await dupCheckin.json();
  console.log(`11. Duplicate Venue Check-in: Status = ${dupData.status} (Duplicate check-in strictly prevented!)`);
  if (dupData.status !== "already") throw new Error("Duplicate check-in was not blocked");

  // 12. Check Admin Dashboard & CSV Export
  const exportRes = await fetch(`${BASE}/api/admin/export`, {
    headers: { Cookie: adminCookie },
  });
  const csvText = await exportRes.text();
  console.log(`12. Admin CSV Export: HTTP ${exportRes.status}, Rows = ${csvText.split("\n").length}`);
  if (exportRes.status !== 200 || !csvText.includes("CyberTitans")) throw new Error("CSV export failed");

  console.log("=== ALL ROUNDTRIP VERIFICATIONS COMPLETED WITH 100% SUCCESS ===");
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error("Roundtrip error:", e);
  process.exit(1);
});
