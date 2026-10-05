import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiRouter } from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { ENV } from "./config/env.config";
import { HttpError } from "./utils/response.util";

export const app = express();

// Trust proxy for rate-limiting behind reverse proxy / Next.js
app.set("trust proxy", 1);

// CORS configuration supporting credentials from frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost port or configured frontend origin
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin === ENV.CORS_ORIGIN ||
        origin === ENV.APP_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local dev
    },
    credentials: true,
  })
);

// Capture rawBody for signature verification on webhooks
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser() as any);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Mount the API Router under /api
app.use("/api", apiRouter);

// 404 Catch-All
app.use((req, _res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found.`, "NOT_FOUND"));
});

// Global Error Handler
app.use(errorHandler);

