import { Queue } from "bullmq";
import { redisConnectionOptions } from "./connection";
import Labels from "../utils/labels";

const qrQueueLog = Labels.createLabel("QR_QUEUE");

export interface QrCodeJob {
  ticketId: string;
  userId: string;
  eventId: string;
  email: string;
  firstName: string;
  qrUuid: string;
}

export const qrQueue = new Queue("qr-code", { connection: redisConnectionOptions });

qrQueueLog.info("QR code queue initialized");

export const addQrCodeJob = async (data: QrCodeJob): Promise<void> => {
  await qrQueue.add("generate-qr-code", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });

  qrQueueLog.info("QR code job added to queue", { ticketId: data.ticketId });
};