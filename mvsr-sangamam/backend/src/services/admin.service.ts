import { prisma } from "../db/prisma.client";
import { Role } from "@prisma/client";
import { eventRepository } from "../repositories/event.repository";
import { registrationRepository } from "../repositories/registration.repository";
import { teamRepository } from "../repositories/team.repository";
import { paymentRepository } from "../repositories/payment.repository";
import { userRepository } from "../repositories/user.repository";
import { FEST } from "../config/fest.config";
import { toCsv } from "../utils/format.util";
import { HttpError } from "../utils/response.util";

export class AdminService {
  async getAdminOverview(search?: string, eventFilter?: string) {
    const [
      events,
      totalRegs,
      confirmedRegs,
      pendingRegs,
      totalTeams,
      hackathonEvent,
      checkInsCount,
      paymentsSum,
      registrations,
    ] = await Promise.all([
      eventRepository.findAll(),
      registrationRepository.count(),
      registrationRepository.count({ status: "CONFIRMED" }),
      registrationRepository.count({ status: "PENDING" }),
      teamRepository.countActive(),
      eventRepository.findBySlug(FEST.hackathon.slug),
      prisma.checkIn.count(),
      paymentRepository.sumPaid(),
      registrationRepository.findAllAdmin(search, eventFilter),
    ]);

    const hackathonRemaining = hackathonEvent
      ? Math.max((hackathonEvent.capacity ?? FEST.hackathon.maxTeams) - hackathonEvent.slotsTaken, 0)
      : 0;

    return {
      stats: {
        totalRegs,
        confirmedRegs,
        pendingRegs,
        totalTeams,
        hackathonRemaining,
        hackathonMax: hackathonEvent?.capacity ?? FEST.hackathon.maxTeams,
        checkInsCount,
        confirmedRevenue: paymentsSum / 100,
      },
      events: events.map((e) => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        category: e.category,
        fee: e.fee,
        pricingMode: e.pricingMode,
        participationType: e.participationType,
        minTeamSize: e.minTeamSize,
        maxTeamSize: e.maxTeamSize,
        capacity: e.capacity,
        slotsTaken: e.slotsTaken,
        accent: e.accent,
        isPublished: e.isPublished,
        registrationOpen: e.registrationOpen,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
      })),
      registrations: registrations.map((r) => ({
        id: r.id,
        code: r.code,
        status: r.status,
        amount: r.amount,
        fullName: r.fullName,
        email: r.email,
        phone: r.phone,
        college: r.college,
        studentId: r.studentId,
        participantCount: r.participantCount,
        createdAt: r.createdAt.toISOString(),
        event: { name: r.event.name, category: r.event.category, slug: r.event.slug },
        team: r.team
          ? {
              code: r.team.code,
              name: r.team.name,
              members: r.team.members.map((m) => ({ name: m.fullName, college: m.college, role: m.role })),
            }
          : null,
        payment: r.payments[0]
          ? { razorpayPaymentId: r.payments[0].razorpayPaymentId, status: r.payments[0].status }
          : null,
        checkIn: r.checkIn
          ? { checkedInAt: r.checkIn.checkedInAt.toISOString(), by: r.checkIn.checkedInBy.name }
          : null,
      })),
    };
  }

  async exportRegistrationsCsv(eventId?: string) {
    const regs = await prisma.registration.findMany({
      where: eventId && eventId !== "ALL" ? { eventId } : {},
      orderBy: { createdAt: "asc" },
      include: {
        event: true,
        payments: { where: { status: "PAID" }, take: 1 },
        team: { include: { members: { orderBy: { joinedAt: "asc" } } } },
        checkIn: { include: { checkedInBy: true } },
      },
    });

    const headers = [
      "Registration Code",
      "Event Name",
      "Category",
      "Status",
      "Primary Contact Name",
      "Email",
      "Phone",
      "College",
      "Student ID",
      "Team Name",
      "Team Code",
      "Team Size",
      "Team Members (Roster)",
      "Amount (INR)",
      "Payment ID",
      "Created At (UTC)",
      "Checked In?",
      "Checked In At",
      "Checked In By",
    ];

    const rows = regs.map((r) => {
      const roster = r.team?.members
        ?.map((m) => `${m.fullName} [${m.role}] (${m.college}${m.studentId ? ` · ${m.studentId}` : ""})`)
        .join(" | ");

      return [
        r.code,
        r.event.name,
        r.event.category,
        r.status,
        r.fullName,
        r.email,
        r.phone,
        r.college,
        r.studentId ?? "",
        r.team?.name ?? "",
        r.team?.code ?? "",
        r.team?.memberCount ?? r.participantCount,
        roster ?? "",
        r.amount,
        r.payments[0]?.razorpayPaymentId ?? "",
        r.createdAt.toISOString(),
        r.checkIn ? "YES" : "NO",
        r.checkIn?.checkedInAt.toISOString() ?? "",
        r.checkIn?.checkedInBy.name ?? "",
      ];
    });

    return toCsv(headers, rows);
  }

  async promoteUser(email: string, role: Role) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(404, `User with email ${email} was not found.`, "NOT_FOUND");
    }
    const updated = await userRepository.updateRole(email, role);
    return { id: updated.id, email: updated.email, role: updated.role };
  }
}

export const adminService = new AdminService();
