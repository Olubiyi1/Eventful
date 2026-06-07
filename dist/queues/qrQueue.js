"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addQrCodeJob = exports.qrQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
const labels_1 = __importDefault(require("../utils/labels"));
const qrQueueLog = labels_1.default.createLabel("QR_QUEUE");
exports.qrQueue = new bullmq_1.Queue("qr-code", { connection: connection_1.redisConnectionOptions });
qrQueueLog.info("QR code queue initialized");
const addQrCodeJob = async (data) => {
    await exports.qrQueue.add("generate-qr-code", data, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    });
    qrQueueLog.info("QR code job added to queue", { ticketId: data.ticketId });
};
exports.addQrCodeJob = addQrCodeJob;
//# sourceMappingURL=qrQueue.js.map