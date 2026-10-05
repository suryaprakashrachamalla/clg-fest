import { z } from "zod";

export const promoteUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["PARTICIPANT", "ORGANIZER", "ADMIN"]),
});

export const checkinTokenSchema = z.object({
  token: z.string().trim().min(1),
});

export type PromoteUserInput = z.infer<typeof promoteUserSchema>;
export type CheckinTokenInput = z.infer<typeof checkinTokenSchema>;
