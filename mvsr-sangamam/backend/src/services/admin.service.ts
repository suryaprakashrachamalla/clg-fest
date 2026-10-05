import { prisma, REGISTRATION_INCLUDE } from "../db/prisma.client";
import { Role } from "@prisma/client";
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
      paymentAggregate,
      registrations,
    ] = await Promise.all([
      prisma.event.findMany({ orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }] }),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "CONFIRMED" } }),
      prisma.registration.count({ where: { status: "PENDING" } }),
      prisma.team.count({ where: { status: "ACTIVE" } }),
      prisma.event.findUnique({ where: { slug: FEST.hackathon.slug } }),
      prisma.checkIn.count(),
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
      prisma.registration.findMany({
        where: {
          ...(eventFilter && eventFilter !== "ALL" ? { eventId: eventFilter } : {}),
          ...(search
            ? {
                OR: [
                  { code: { contains: search, mode: "insensitive" } },
                  { fullName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                  { teamName: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        include: REGISTRATION_INCLUDE,
      }),
    ]);

    const paymentsSum = paymentAggregate._sum.amount ?? 0;

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
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new HttpError(404, `User with email ${email} was not found.`, "NOT_FOUND");
    }
    const updated = await prisma.user.update({
      where: { email: normalizedEmail },
      data: { role },
    });
    return { id: updated.id, email: updated.email, role: updated.role };
  }
}

export const adminService = new AdminService();
