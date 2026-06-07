"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRedisConnection = void 0;
const ioredis_1 = require("ioredis");
const labels_1 = __importDefault(require("../utils/labels"));
const redisLog = labels_1.default.createLabel("REDIS");
const redisUrl = process.env.REDIS_URL;
const redisConnection = redisUrl
    ? new ioredis_1.Redis(redisUrl, { maxRetriesPerRequest: null })
    : new ioredis_1.Redis({ host: "localhost", port: 6379, maxRetriesPerRequest: null });
redisConnection.on("connect", () => {
    redisLog.info("Redis connected");
});
redisConnection.on("error", (err) => {
    redisLog.error("Redis connection error", { err });
});
const checkRedisConnection = async () => {
    const ping = await redisConnection.ping();
    if (ping === "PONG") {
        redisLog.info("Redis connection verified");
    }
    else {
        throw new Error("Redis connection failed");
    }
};
exports.checkRedisConnection = checkRedisConnection;
exports.default = redisConnection;
//# sourceMappingURL=redis.js.map