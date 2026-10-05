import { prisma, REGISTRATION_INCLUDE } from "../db/prisma.client";
import { qrDataUrl, invitationUrl } from "../utils/qr.util";

export class DashboardService {
  async getUserDashboard(userId: string) {
    const [registrations, memberships] = await Promise.all([
      prisma.registration.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: REGISTRATION_INCLUDE,
      }),
      prisma.teamMember.findMany({
        where: { userId, role: "MEMBER" },
        include: {
          team: {
            include: {
              event: true,
              leader: { select: { name: true, email: true } },
              members: { orderBy: { joinedAt: "asc" } },
              registration: {
                select: { id: true, code: true, qrToken: true, status: true, amount: true },
              },
            },
          },
        },
      }),
    ]);

    const regItems = await Promise.all(
      registrations.map(async (r) => {
        const qrImage = r.qrToken ? await qrDataUrl(r.qrToken) : null;
        const inviteLink = r.team?.invitation?.code ? invitationUrl(r.team.invitation.code) : null;
        return {
          id: r.id,
          code: r.code,
          status: r.status,
          amount: r.amount,
          createdAt: r.createdAt.toISOString(),
          paymentStatus: r.amount === 0 ? "FREE" : r.payments[0]?.status ?? "UNPAID",
          event: {
            name: r.event.name,
            category: r.event.category,
            venue: r.event.venue,
            startsAt: r.event.startsAt.toISOString(),
          },
          team: r.team
            ? {
                id: r.team.id,
                name: r.team.name,
                code: r.team.code,
                paidCapacity: r.team.paidCapacity,
                memberCount: r.team.memberCount,
                invitationCode: r.team.invitation?.code ?? null,
                inviteLink,
                members: r.team.members.map((m) => ({
                  name: m.fullName,
                  role: m.role,
                  college: m.college,
                })),
              }
            : null,
          qrImage,
        };
      })
    );

    const memberItems = await Promise.all(
      memberships.map(async (m) => {
        const qrImage = m.team.registration.qrToken
          ? await qrDataUrl(m.team.registration.qrToken)
          : null;
        return {
          id: m.team.registration.id,
          code: m.team.registration.code,
          teamName: m.team.name,
          teamCode: m.team.code,
          leaderName: m.team.leader.name,
          memberCount: m.team.memberCount,
          paidCapacity: m.team.paidCapacity,
          event: {
            name: m.team.event.name,
            category: m.team.event.category,
            venue: m.team.event.venue,
            startsAt: m.team.event.startsAt.toISOString(),
          },
          members: m.team.members.map((mem) => ({
            name: mem.fullName,
            role: mem.role,
            college: mem.college,
          })),
          qrImage,
        };
      })
    );

    return {
      registrations: regItems,
      memberships: memberItems,
    };
  }
}

export const dashboardService = new DashboardService();
