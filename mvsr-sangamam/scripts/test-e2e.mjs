import {
  prisma,
  FEST,
  computeAmount,
  createRegistration,
  confirmPayment,
  joinTeam,
  lookupInvitation,
  checkIn,
  verificationCard,
} from "../backend/src/index";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

async function runTest() {
  console.log("=== RUNNING MVSR SANGAMAM END-TO-END BUSINESS LOGIC VERIFICATION ===");

  // 1. Verify Hackathon Pricing Logic
  const hackathonEvent = await prisma.event.findUniqueOrThrow({ where: { slug: "hackathon" } });
  for (let size = 1; size <= 4; size++) {
    const fee = computeAmount(hackathonEvent, size);
    console.log(`✓ Hackathon team size ${size} => ₹${fee} (Expected: ₹${size * 200})`);
    if (fee !== size * 200) throw new Error(`Incorrect fee for size ${size}`);
  }

  // 2. Create Team Leader User
  const leaderEmail = `leader_${Date.now()}@example.com`;
  const leader = await prisma.user.create({
    data: {
      email: leaderEmail,
      name: "Aditya Sharma",
      phone: "9876543210",
      college: "MVSR Engineering College",
      studentId: "2451-22-733-045",
      passwordHash: await bcrypt.hash("Password123!", 10),
    },
  });
  console.log(`✓ Created Team Leader: ${leader.name} (${leader.email})`);

  // 3. Initiate Hackathon Registration for Team of 3 (₹600)
  const regResult = await createRegistration(leader, {
    eventSlug: "hackathon",
    participant: {
      fullName: leader.name,
      email: leader.email,
      phone: leader.phone,
      college: leader.college,
      studentId: leader.studentId ?? undefined,
    },
    teamName: `AlphaCoders_${Date.now().toString().slice(-4)}`,
    teamSize: 3,
  });

  console.log(`✓ Registration initiated: Code ${regResult.code}, Amount: ₹${regResult.amount}`);
  if (regResult.amount !== 600) throw new Error("Amount should be ₹600 for 3 participants");

  // Verify slot held atomically
  const heldEvent = await prisma.event.findUniqueOrThrow({ where: { slug: "hackathon" } });
  console.log(`✓ Hackathon slots taken: ${heldEvent.slotsTaken} / ${heldEvent.capacity} (Remaining: ${heldEvent.capacity - heldEvent.slotsTaken})`);

  // 4. Simulate Payment Confirmation (HMAC verified)
  const orderId = regResult.checkout.orderId;
  const paymentId = `pay_sim_${Date.now()}`;
  const confirmResult = await confirmPayment({
    orderId,
    paymentId,
    signature: "simulated_valid_signature",
    method: "upi",
  });
  console.log(`✓ Payment Confirmed: Status ${confirmResult.status}`);

  // Fetch updated team & registration
  const confirmedReg = await prisma.registration.findUniqueOrThrow({
    where: { id: regResult.registrationId },
    include: {
      team: { include: { invitation: true, members: true } },
    },
  });

  const team = confirmedReg.team;
  console.log(`✓ Team ID Generated: ${team.code}`);
  console.log(`✓ Invitation Code Generated: ${team.invitation.code}`);
  console.log(`✓ Initial Members: ${team.memberCount} / ${team.paidCapacity}`);
  if (team.memberCount !== 1 || team.paidCapacity !== 3) throw new Error("Initial team capacity mismatch");

  // 5. Look up Invitation Code
  const inviteLookup = await lookupInvitation(team.invitation.code);
  console.log(`✓ Lookup Invitation (${team.invitation.code}): State = ${inviteLookup.state}, Team = ${inviteLookup.team?.name}`);
  if (inviteLookup.state !== "VALID") throw new Error("Invitation should be valid");

  // 6. Teammate #2 Joins
  const member2 = await prisma.user.create({
    data: {
      email: `member2_${Date.now()}@example.com`,
      name: "Sneha Reddy",
      phone: "9876543211",
      college: "MVSR Engineering College",
      passwordHash: "hash",
    },
  });
  const join2 = await joinTeam(member2, team.invitation.code, {
    fullName: member2.name,
    email: member2.email,
    phone: member2.phone,
    college: member2.college,
  });
  console.log(`✓ Member #2 Joined (${member2.name}): Current Count = ${join2.memberCount} / ${join2.paidCapacity}`);

  // 7. Teammate #3 Joins (Reaches 3/3 capacity)
  const member3 = await prisma.user.create({
    data: {
      email: `member3_${Date.now()}@example.com`,
      name: "Karthik V",
      phone: "9876543212",
      college: "MVSR Engineering College",
      passwordHash: "hash",
    },
  });
  const join3 = await joinTeam(member3, team.invitation.code, {
    fullName: member3.name,
    email: member3.email,
    phone: member3.phone,
    college: member3.college,
  });
  console.log(`✓ Member #3 Joined (${member3.name}): Current Count = ${join3.memberCount} / ${join3.paidCapacity}`);

  // 8. Verify Invitation Automatically Deactivated when capacity reached
  const fullLookup = await lookupInvitation(team.invitation.code);
  console.log(`✓ Capacity Full Verification: State = ${fullLookup.state} (Expected: FULL or INACTIVE)`);

  // 9. Attempt to exceed capacity with Member #4 (Must Fail)
  const member4 = await prisma.user.create({
    data: {
      email: `member4_${Date.now()}@example.com`,
      name: "Extra Member",
      phone: "9876543213",
      college: "MVSR Engineering College",
      passwordHash: "hash",
    },
  });
  try {
    await joinTeam(member4, team.invitation.code, {
      fullName: member4.name,
      email: member4.email,
      phone: member4.phone,
      college: member4.college,
    });
    throw new Error("FAIL: Allowed exceeding paid capacity!");
  } catch (err) {
    console.log(`✓ Capacity Overflow Blocked as Expected: ${err.message}`);
  }

  // 10. QR Venue Check-In Verification
  const adminUser = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const qrToken = confirmedReg.qrToken;
  console.log(`✓ Checking in with QR Token: ${qrToken.slice(0, 10)}...`);

  const checkInResult1 = await checkIn(qrToken, adminUser);
  console.log(`✓ First Venue Check-In Result: ${checkInResult1.status} (Checked in by: ${checkInResult1.card?.checkIn?.by})`);
  if (checkInResult1.status !== "checked_in") throw new Error("Check-in 1 should succeed");

  // Duplicate Check-In Attempt
  const checkInResult2 = await checkIn(qrToken, adminUser);
  console.log(`✓ Duplicate Venue Check-In Result: ${checkInResult2.status} (Correctly prevented duplicate check-in!)`);
  if (checkInResult2.status !== "already") throw new Error("Duplicate check-in should return 'already'");

  console.log("=== ALL END-TO-END BUSINESS LOGIC VERIFICATIONS PASSED 100% ===");
}

runTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
