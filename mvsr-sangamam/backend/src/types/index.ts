import { Request } from "express";
import { User } from "@prisma/client";

export type UserRole = "PARTICIPANT" | "ORGANIZER" | "ADMIN";

export interface SessionPayload {
  sub: string;
  role: UserRole;
  name: string;
}

export type AuthenticatedUser = User;

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  session?: SessionPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}
