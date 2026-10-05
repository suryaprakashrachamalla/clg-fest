import { Response, NextFunction } from "express";
import { prisma } from "../db/prisma.client";
import { SESSION_COOKIE, verifySession } from "../utils/jwt.util";
import { HttpError } from "../utils/response.util";
import { AuthenticatedRequest } from "../types";

export async function resolveUserFromRequest(req: AuthenticatedRequest) {
  if (req.user) return req.user;

  // Check cookies or Authorization header
  let token = req.cookies?.[SESSION_COOKIE];
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  const session = await verifySession(token);
  if (!session) return null;

  req.session = session;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
  });

  if (user) {
    req.user = user;
    return user;
  }
  return null;
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await resolveUserFromRequest(req);
    next();
  } catch {
    next();
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      return next(new HttpError(401, "Please sign in to continue.", "UNAUTHENTICATED"));
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireOrganizer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      return next(new HttpError(401, "Please sign in to continue.", "UNAUTHENTICATED"));
    }
    if (user.role !== "ADMIN" && user.role !== "ORGANIZER") {
      return next(new HttpError(403, "Organizer access required.", "FORBIDDEN"));
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      return next(new HttpError(401, "Please sign in to continue.", "UNAUTHENTICATED"));
    }
    if (user.role !== "ADMIN") {
      return next(new HttpError(403, "Admin access required.", "FORBIDDEN"));
    }
    next();
  } catch (err) {
    next(err);
  }
}
