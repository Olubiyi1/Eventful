"use strict";
// this file is used ny bullMq for queue
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnectionOptions = void 0;
const redisUrl = process.env.REDIS_URL;
exports.redisConnectionOptions = redisUrl
    ? { url: redisUrl, maxRetriesPerRequest: null }
    : { host: "localhost", port: 6379, maxRetriesPerRequest: null };
//# sourceMappingURL=connection.js.map