import { z } from "zod";
import { participantSchema } from "./auth.validator";

export const createRegistrationSchema = z.object({
  eventSlug: z.string().trim().min(1).max(80),
  participant: participantSchema,
  teamSize: z.coerce.number().int().min(1).max(20).default(1),
  teamName: z
    .string()
    .trim()
    .min(2, "Team name is too short")
    .max(40, "Team name is too long")
    .regex(/^[\p{L}\p{N} ._\-&]+$/u, "Use letters, numbers, spaces and . _ - & only")
    .optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
});

export const paymentFailureSchema = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  reason: z.string().max(300).optional(),
  kind: z.enum(["failed", "cancelled"]),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type PaymentFailureInput = z.infer<typeof paymentFailureSchema>;
