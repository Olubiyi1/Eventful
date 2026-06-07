"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const connection_1 = require("../connection");
const prisma_1 = __importDefault(require("../../config/prisma"));
const emailTransporter_1 = __importDefault(require("../../helpers/emailTransporter"));
const qrcode_1 = __importDefault(require("qrcode"));
const labels_1 = __importDefault(require("../../utils/labels"));
const config_1 = __importDefault(require("../../config/config"));
const qrWorkerLog = labels_1.default.createLabel("QR_WORKER");
const processQrJob = async (job) => {
    const { ticketId, userId, eventId, email, firstName, qrUuid } = job.data;
    const qrDataUrl = await qrcode_1.default.toDataURL(qrUuid);
    await prisma_1.default.ticket.update({
        where: { id: ticketId },
        data: { qrImageUrl: qrDataUrl },
    });
    await emailTransporter_1.default.sendMail({
        from: `"Eventful" <${config_1.default.user}>`,
        to: email,
        subject: "Your Eventful Ticket QR Code",
        html: `
      <h2>Hi ${firstName},</h2>
      <p>Your ticket has been confirmed. Here is your QR code for entry:</p>
      <img src="${qrDataUrl}" alt="QR Code" />
      <p>Please present this QR code at the event entrance.</p>
      <p>Event ID: ${eventId}</p>
    `,
    });
    qrWorkerLog.info("QR code generated and emailed", { ticketId, email });
};
const qrWorker = new bullmq_1.Worker("qr-code", processQrJob, {
    connection: connection_1.redisConnectionOptions,
});
qrWorker.on("completed", (job) => {
    qrWorkerLog.info("QR code job completed", { jobId: job.id });
});
qrWorker.on("failed", (job, err) => {
    qrWorkerLog.error("QR code job failed", { jobId: job?.id, error: err.message });
});
exports.default = qrWorker;
//# sourceMappingURL=qrWorker.js.map