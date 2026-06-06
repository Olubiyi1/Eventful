import { Queue } from "bullmq";
import { redisConnectionOptions } from "./connection";
import Labels from "../utils/labels";

const EmailQueueLog = Labels.createLabel("EMAIL_QUEUE");

export interface VerificationEmailJob {
  email: string;
  firstName: string;
  token: string;
}

export const emailQueue = new Queue("email", { connection: redisConnectionOptions });

EmailQueueLog.info("Email queue initialized");

export const addVerificationEmailJob = async (
  data: VerificationEmailJob
): Promise<void> => {
  await emailQueue.add("send-verification-email", data, {
    attempts: 3,
    backoff: {
        // type: exponential ensures retry waits longer than the previous one
      type: "exponential",
      delay: 5000,
    },
  });

  EmailQueueLog.info("Verification email job added to queue", { email: data.email });
};