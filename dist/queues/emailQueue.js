"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVerificationEmailJob = exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
const labels_1 = __importDefault(require("../utils/labels"));
const EmailQueueLog = labels_1.default.createLabel("EMAIL_QUEUE");
exports.emailQueue = new bullmq_1.Queue("email", { connection: connection_1.redisConnectionOptions });
EmailQueueLog.info("Email queue initialized");
const addVerificationEmailJob = async (data) => {
    await exports.emailQueue.add("send-verification-email", data, {
        attempts: 3,
        backoff: {
            // type: exponential ensures retry waits longer than the previous one
            type: "exponential",
            delay: 5000,
        },
    });
    EmailQueueLog.info("Verification email job added to queue", { email: data.email });
};
exports.addVerificationEmailJob = addVerificationEmailJob;
//# sourceMappingURL=emailQueue.js.map