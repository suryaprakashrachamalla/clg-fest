import { Prisma, User } from "@prisma/client";
import { prisma } from "../db/prisma.client";
import { ParticipantInput } from "../validators/auth.validator";
import { HttpError } from "../utils/response.util";

export type InviteState = "VALID" | "INVALID" | "EXPIRED" | "FULL" | "INACTIVE";

const STATE_MESSAGES: Record<Exclude<InviteState, "VALID">, [number, string]> = {
  INVALID: [404, "That invitation code doesn't exist. Check with your team leader."],
  EXPIRED: [410, "This invitation code has expired."],
  FULL: [409, "This team is already full — all paid slots have been taken."],
  INACTIVE: [409, "This invitation is no longer active."],
};

export class TeamService {
  async lookupInvitation(code: string) {
    const inv = await prisma.invitationCode.findUnique({
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
    if (!inv) return { state: "INVALID" as InviteState, team: null };

    const t = inv.team;
    let state: InviteState = "VALID";
    if (t.status !== "ACTIVE") state = "INACTIVE";
    else if (t.memberCount >= t.paidCapacity) state = "FULL";
    else if (!inv.isActive) state = "INACTIVE";
    else if (inv.expiresAt < new Date()) state = "EXPIRED";

    return {
      state,
      team: {
        id: t.id,
        name: t.name,
        code: t.code,
        leader: t.leader.name,
        memberCount: t.memberCount,
        paidCapacity: t.paidCapacity,
        members: t.members.map((m) => ({
          name: m.fullName,
          role: m.role,
          college: m.college,
        })),
        event: t.event,
        expiresAt: inv.expiresAt,
      },
    };
  }

  async joinTeam(user: User, code: string, participant: ParticipantInput) {
    const { state, team } = await this.lookupInvitation(code);
    if (state !== "VALID" || !team) {
      const [status, msg] = STATE_MESSAGES[state as Exclude<InviteState, "VALID">];
      throw new HttpError(status, msg, state);
    }

    const already = await prisma.teamMember.findUnique({
      where: { eventId_userId: { eventId: team.event.id, userId: user.id } },
    });
    if (already) {
      const teamRecord = await prisma.team.findUnique({ where: { id: already.teamId } });
      throw new HttpError(
        409,
        `You are already in team "${teamRecord?.name ?? "another team"}" for this event.`,
        "ALREADY_IN_TEAM"
      );
    }

    const activeReg = await prisma.registration.findUnique({
      where: { activeKey: `${user.id}:${team.event.id}` },
    });
    if (activeReg) {
      throw new HttpError(409, "You already have your own registration for this event.", "ALREADY_REGISTERED");
    }

    const email = user.email;
    const dupEmail = await prisma.teamMember.findFirst({
      where: { eventId: team.event.id, email },
    });
    if (dupEmail) {
      throw new HttpError(409, "A participant with this email is already registered in a team.", "DUPLICATE_PARTICIPANT");
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const claimed = await tx.$executeRaw`
          UPDATE "Team" SET "memberCount" = "memberCount" + 1
          WHERE "id" = ${team.id} AND "status" = 'ACTIVE' AND "memberCount" < "paidCapacity"`;
        if (claimed !== 1) throw new HttpError(409, STATE_MESSAGES.FULL[1], "FULL");

        await tx.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            eventId: team.event.id,
            role: "MEMBER",
            fullName: participant.fullName,
            email,
            phone: participant.phone,
            college: participant.college,
            studentId: participant.studentId ?? null,
          },
        });

        const updated = await tx.team.findUniqueOrThrow({
          where: { id: team.id },
          select: { memberCount: true, paidCapacity: true },
        });

        if (updated.memberCount >= updated.paidCapacity) {
          await tx.invitationCode.updateMany({
            where: { teamId: team.id },
            data: { isActive: false },
          });
        }
        return { teamId: team.id, teamName: team.name, ...updated };
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new HttpError(409, "You are already part of a team for this event.", "ALREADY_IN_TEAM");
      }
      throw e;
    }
  }
}

export const teamService = new TeamService();
