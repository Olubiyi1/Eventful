import "./config/config.env"
import app from "./app";
import dotenv from "dotenv";
import config from "./config/config";
import Labels from "./utils/labels";
import prisma from "./config/prisma";
import { checkRedicConnection } from "./queues/connection";

dotenv.config();

const dbLog = Labels.createLabel("DATABASE")

let server: ReturnType<typeof app.listen>;

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    dbLog.info("Database connected");

    await checkRedicConnection

    server = app.listen(config.port || 3000, () => {
      dbLog.info("Server up and running");
    });
  } catch (error) {
    dbLog.error("Failed to start server", { error });
    process.exit(1);
  }
};

const shutdown = (): void => {
  dbLog.info("Shutting down gracefully...");
  server.close(() => {
    dbLog.info("Shutdown complete");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", (error: Error) => {
  dbLog.error("Uncaught Exception:", {error});
  shutdown();
});
process.on("unhandledRejection", (reason: unknown) => {
  dbLog.error("Unhandled Rejection:", {reason});
  shutdown();
});

startServer();