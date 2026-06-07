"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const connection_1 = require("../connection");
const emailTransporter_1 = __importDefault(require("../../helpers/emailTransporter"));
const labels_1 = __importDefault(require("../../utils/labels"));
const emailWorkerLog = labels_1.default.createLabel("EMAIL_WORKER");
const processEmailJob = async (job) => {
    const { email, firstName, token } = job.data;
    const verificationUrl = `${process.env.APP_URL}/api/v1/users/verify-email?token=${token}`;
    await emailTransporter_1.default.sendMail({
        from: `"Eventful" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email",
        html: `
      <h2>Hi ${firstName},</h2>
      <p>Thanks for signing up on Eventful. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
    });
    emailWorkerLog.info("Verification email sent", { email });
};
const emailWorker = new bullmq_1.Worker("email", processEmailJob, {
    connection: connection_1.redisConnectionOptions,
});
emailWorker.on("completed", (job) => {
    emailWorkerLog.info("Email job completed", { jobId: job.id });
});
emailWorker.on("failed", (job, err) => {
    emailWorkerLog.error("Email job failed", { jobId: job?.id, error: err.message });
});
exports.default = emailWorker;
//# sourceMappingURL=emailWorker.js.map