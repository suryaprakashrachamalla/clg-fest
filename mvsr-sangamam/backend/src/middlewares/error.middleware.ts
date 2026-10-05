import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/response.util";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const path = first?.path.join(".") || "body";
    const msg = first ? `${path ? `${path}: ` : ""}${first.message}` : "Validation failed";
    return res.status(400).json({
      error: msg,
      code: "VALIDATION_FAILED",
      details: err.flatten(),
    });
  }

  // 2. Custom HttpError
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
      ...(err.extra ? { details: err.extra } : {}),
    });
  }

  // 3. Prisma Known Request Errors
  if (err?.code === "P2002") {
    return res.status(409).json({
      error: "A record with these details already exists.",
      code: "UNIQUE_CONSTRAINT",
    });
  }

  if (err?.code === "P2025") {
    return res.status(404).json({
      error: "Requested record was not found.",
      code: "NOT_FOUND",
    });
  }

  // 4. Default Internal Server Error
  console.error("[ServerError]", req.method, req.originalUrl, err);
  return res.status(500).json({
    error: "An unexpected error occurred. Please try again later.",
    code: "INTERNAL_ERROR",
  });
}
