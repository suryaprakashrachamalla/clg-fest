import { Response } from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = "BAD_REQUEST",
    public extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function sendSuccess<T>(res: Response, data: T, status: number = 200) {
  // If data already has root properties or needs direct serialization,
  // we return it cleanly to be compatible with both REST structures.
  return res.status(status).json(data);
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  code: string = "ERROR",
  details?: unknown
) {
  return res.status(status).json({
    error: message,
    code,
    ...(details ? { details } : {}),
  });
}
