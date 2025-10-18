import app from "@/app.js";
import { database } from "@/config/db.config.js";
import { config } from "@/config/env.config.js";
import { logger } from "@/config/logger.config.js";

async function startServer() {
  try {
    // test database connection
    logger.info("Testing database connection...");
    const isConnected = await database.testConnection();

    if (!isConnected) {
      logger.error("Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // start http server
    const server = app.listen(config.app.port, () => {
      logger.info(`Server running on port ${config.app.port}`);
      logger.info(`Environment: ${config.app.env}`);
      logger.info(`Health check: http://localhost:${config.app.port}/health`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Close http server
      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          // close database connections
          await database.closePool();
          logger.info("Database connections closed");

          logger.info("Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forceful shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: any) => {
      logger.error("Unhandled Rejection:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
