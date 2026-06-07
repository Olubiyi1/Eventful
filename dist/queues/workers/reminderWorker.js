"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const connection_1 = require("../connection");
const emailTransporter_1 = __importDefault(require("../../helpers/emailTransporter"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const labels_1 = __importDefault(require("../../utils/labels"));
const config_1 = __importDefault(require("../../config/config"));
const reminderWorkerLog = labels_1.default.createLabel("REMINDER_WORKER");
const processReminderJob = async (job) => {
    const { userId, eventId, email, firstName, eventTitle, eventDate, eventLocation } = job.data;
    await emailTransporter_1.default.sendMail({
        from: `"Eventful" <${config_1.default.user}>`,
        to: email,
        subject: `Reminder: ${eventTitle} is coming up!`,
        html: `
      <h2>Hi ${firstName},</h2>
      <p>This is a reminder that <strong>${eventTitle}</strong> is coming up soon.</p>
      <p><strong>Date:</strong> ${new Date(eventDate).toDateString()}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
      <p>Don't forget to bring your QR code ticket for entry.</p>
    `,
    });
    await prisma_1.default.reminder.update({
        where: { userId_eventId: { userId, eventId } },
        data: { sent: true },
    });
    reminderWorkerLog.info("Reminder sent", { userId, eventId });
};
const reminderWorker = new bullmq_1.Worker("reminder", processReminderJob, {
    connection: connection_1.redisConnectionOptions,
});
reminderWorker.on("completed", (job) => {
    reminderWorkerLog.info("Reminder job completed", { jobId: job.id });
});
reminderWorker.on("failed", (job, err) => {
    reminderWorkerLog.error("Reminder job failed", { jobId: job?.id, error: err.message });
});
exports.default = reminderWorker;
//# sourceMappingURL=reminderWorker.js.map