"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/config.env");
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("./config/config"));
const labels_1 = __importDefault(require("./utils/labels"));
const prisma_1 = __importDefault(require("./config/prisma"));
const redis_1 = require("./config/redis");
require("./queues/workers/emailWorker");
require("./queues/workers/qrWorker");
require("./queues/workers/reminderWorker");
dotenv_1.default.config();
const dbLog = labels_1.default.createLabel("DATABASE");
let server;
const startServer = async () => {
    try {
        await prisma_1.default.$connect();
        dbLog.info("Database connected");
        await redis_1.checkRedisConnection;
        server = app_1.default.listen(config_1.default.port || 3000, () => {
            dbLog.info("Server up and running");
        });
    }
    catch (error) {
        dbLog.error("Failed to start server", { error });
        process.exit(1);
    }
};
const shutdown = () => {
    dbLog.info("Shutting down gracefully...");
    server.close(() => {
        dbLog.info("Shutdown complete");
        process.exit(0);
    });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", (error) => {
    dbLog.error("Uncaught Exception:", { error });
    shutdown();
});
process.on("unhandledRejection", (reason) => {
    dbLog.error("Unhandled Rejection:", { reason });
    shutdown();
});
startServer();
//# sourceMappingURL=server.js.map