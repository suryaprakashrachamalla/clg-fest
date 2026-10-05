import { prisma } from "../db/prisma.client";
import { Team, TeamMember, InvitationCode, Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export class TeamRepository {
  async findById(id: string): Promise<Team | null> {
    return prisma.team.findUnique({ where: { id } });
  }

  async findByRegistrationId(registrationId: string): Promise<Team | null> {
    return prisma.team.findUnique({ where: { registrationId } });
  }

  async findByName(eventId: string, name: string): Promise<Team | null> {
    return prisma.team.findUnique({
      where: { eventId_name: { eventId, name } },
    });
  }

  async findUserMembership(eventId: string, userId: string): Promise<TeamMember | null> {
    return prisma.teamMember.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
  }

  async findByInvitationCode(code: string) {
    return prisma.invitationCode.findUnique({
      where: { code },
      include: {
        team: {
          include: {
            event: { select: { id: true, name: true, slug: true, startsAt: true, venue: true } },
            members: {
              orderBy: { joinedAt: "asc" },
              select: { fullName: true, role: true, college: true },
            },
            leader: { select: { name: true } },
          },
        },
      },
    });
  }

  /** Atomic seat increment limited by paidCapacity */
  async claimSeat(tx: Tx, teamId: string): Promise<boolean> {
    const claimed = await tx.$executeRaw`
      UPDATE "Team" SET "memberCount" = "memberCount" + 1
      WHERE "id" = ${teamId} AND "status" = 'ACTIVE' AND "memberCount" < "paidCapacity"`;
    return claimed === 1;
  }

  async countActive(): Promise<number> {
    return prisma.team.count({ where: { status: "ACTIVE" } });
  }
}

export const teamRepository = new TeamRepository();
