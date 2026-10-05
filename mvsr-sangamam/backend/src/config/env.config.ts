import dotenv from "dotenv";
import path from "path";

// Load .env file from backend root or parent
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

export const ENV = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://sangamam:sangamam@localhost:5433/sangamam?schema=public",
  AUTH_SECRET: process.env.AUTH_SECRET || "sangamam_default_jwt_secret_must_be_over_32_characters_long",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_sangamam",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "SangamamSecret2026TestSandboxKey",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@mvsrsangamam.in",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Sangamam@Admin2026",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};
