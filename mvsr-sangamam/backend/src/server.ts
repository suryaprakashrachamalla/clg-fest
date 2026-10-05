import { app } from "./app";
import { ENV } from "./config/env.config";
import { prisma } from "./db/prisma.client";

const PORT = ENV.PORT;

async function bootstrap() {
  try {
    // Verify database connectivity
    try {
      await prisma.$connect();
      console.log("✓ Connected to PostgreSQL database via Prisma.");
    } catch (dbErr) {
      console.warn("⚠️ Database connection failed or offline. Starting API in fallback mode.", (dbErr as Error).message);
    }

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 MVSR Sangamam Backend API running on port ${PORT}`);
      console.log(`📡 Base URL: http://localhost:${PORT}/api`);
      console.log(`🩺 Health:   http://localhost:${PORT}/health`);
      console.log(`===============================================`);
    });


    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("✓ Prisma disconnected. Backend shutdown complete.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start backend server:", error);
    process.exit(1);
  }
}

bootstrap();
