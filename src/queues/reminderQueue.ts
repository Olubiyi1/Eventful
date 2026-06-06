import { Queue } from "bullmq";
import { redisConnectionOptions } from "./connection";
import Labels from "../utils/labels";

const qrQueueLog = Labels.createLabel("REMINDER_QUEUE");

export interface ReminderJob {
  userId: string;
  eventId: string;
  email: string;
  firstName: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
}

export const reminderQueue = new Queue("reminder", {
  connection: redisConnectionOptions,
});

qrQueueLog.info("Reminder queue initialized");

export const addReminderJob = async (
  data: ReminderJob,
  remindAt: Date
): Promise<void> => {
  const delay = remindAt.getTime() - Date.now();

  if (delay <= 0) {
    qrQueueLog.warn("Reminder time is in the past, skipping", {
      userId: data.userId,
      eventId: data.eventId,
    });
    return;
  }

  await reminderQueue.add("send-reminder", data, {
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