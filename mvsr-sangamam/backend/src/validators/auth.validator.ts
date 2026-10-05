import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, ""))
  .refine((s) => /^(\+91)?[6-9]\d{9}$/.test(s), "Enter a valid 10-digit Indian mobile number");

export const nameSchema = z.string().trim().min(2, "Too short").max(80, "Too long");
export const collegeSchema = z.string().trim().min(2, "Too short").max(150, "Too long");
export const studentIdSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const signupSchema = z.object({
  name: nameSchema,
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(120),
  phone: phoneSchema,
  college: collegeSchema,
  studentId: studentIdSchema,
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export const participantSchema = z.object({
  fullName: nameSchema,
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(120),
  phone: phoneSchema,
  college: collegeSchema,
  studentId: studentIdSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ParticipantInput = z.infer<typeof participantSchema>;
