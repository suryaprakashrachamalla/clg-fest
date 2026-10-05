import { z } from "zod";
import { participantSchema } from "./auth.validator";

export const invitationCodeSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
  .refine((s) => /^[A-Z0-9]{6}$/.test(s), "Invitation codes must be 6 alphanumeric characters");

export const joinTeamSchema = z.object({
  code: invitationCodeSchema,
  participant: participantSchema,
});

export type JoinTeamInput = z.infer<typeof joinTeamSchema>;
