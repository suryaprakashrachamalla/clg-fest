import { z } from "zod";
import { participantSchema } from "./auth.validator";

export const invitationCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{6}$/, "Invitation codes are 6 characters");

export const joinTeamSchema = z.object({
  code: invitationCodeSchema,
  participant: participantSchema,
});

export type JoinTeamInput = z.infer<typeof joinTeamSchema>;
