"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReminderJob = exports.reminderQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
const labels_1 = __importDefault(require("../utils/labels"));
const qrQueueLog = labels_1.default.createLabel("REMINDER_QUEUE");
exports.reminderQueue = new bullmq_1.Queue("reminder", {
    connection: connection_1.redisConnectionOptions,
});
qrQueueLog.info("Reminder queue initialized");
const addReminderJob = async (data, remindAt) => {
    const delay = remindAt.getTime() - Date.now();
    if (delay <= 0) {
        qrQueueLog.warn("Reminder time is in the past, skipping", {
            userId: data.userId,
            eventId: data.eventId,
        });
        return;
    }
    await exports.reminderQueue.add("send-reminder", data, {
        delay,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    });
    qrQueueLog.info("Reminder job scheduled", {
        userId: data.userId,
        eventId: data.eventId,
        remindAt,
        delay,
    });
};
exports.addReminderJob = addReminderJob;
//# sourceMappingURL=reminderQueue.js.map