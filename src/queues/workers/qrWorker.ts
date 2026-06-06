import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../connection";
import { QrCodeJob } from "../qrQueue";
import prisma from "../../config/prisma";
import emailTransporter from "../../helpers/emailTransporter";
import QRCode from "qrcode";
import Labels from "../../utils/labels";
import config from "../../config/config";

const qrWorkerLog = Labels.createLabel("QR_WORKER");

const processQrJob = async (job: Job<QrCodeJob>): Promise<void> => {
  const { ticketId, userId, eventId, email, firstName, qrUuid } = job.data;

  const qrDataUrl = await QRCode.toDataURL(qrUuid);

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { qrImageUrl: qrDataUrl },
  });

  await emailTransporter.sendMail({
    from: `"Eventful" <${config.user}>`,
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

const qrWorker = new Worker("qr-code", processQrJob, {
  connection: redisConnectionOptions,
});

qrWorker.on("completed", (job) => {
  qrWorkerLog.info("QR code job completed", { jobId: job.id });
});

qrWorker.on("failed", (job, err) => {
  qrWorkerLog.error("QR code job failed", { jobId: job?.id, error: err.message });
});

export default qrWorker;