import { z } from "zod";

export const promoteUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["PARTICIPANT", "ORGANIZER", "ADMIN"]),
});

export const checkinTokenSchema = z
  .object({
    token: z.string().trim().min(1).optional(),
    payload: z.string().trim().min(1).optional(),
  })
  .transform((data) => ({
    token: data.token || data.payload || "",
  }))
  .refine((data) => data.token.length > 0, {
    message: "Token or payload is required",
    path: ["token"],
  });

export type PromoteUserInput = z.infer<typeof promoteUserSchema>;
export type CheckinTokenInput = z.infer<typeof checkinTokenSchema>;
