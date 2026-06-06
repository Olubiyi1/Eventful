import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../connection";
import { ReminderJob } from "../reminderQueue";
import emailTransporter from "../../helpers/emailTransporter";
import prisma from "../../config/prisma";
import Labels from "../../utils/labels";
import config from "../../config/config";

const reminderWorkerLog = Labels.createLabel("REMINDER_WORKER");

const processReminderJob = async (job: Job<ReminderJob>): Promise<void> => {
  const { userId, eventId, email, firstName, eventTitle, eventDate, eventLocation } = job.data;

  await emailTransporter.sendMail({
    from: `"Eventful" <${config.user}>`,
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

  await prisma.reminder.update({
    where: { userId_eventId: { userId, eventId } },
    data: { sent: true },
  });

  reminderWorkerLog.info("Reminder sent", { userId, eventId });
};

const reminderWorker = new Worker("reminder", processReminderJob, {
  connection: redisConnectionOptions,
});

reminderWorker.on("completed", (job) => {
  reminderWorkerLog.info("Reminder job completed", { jobId: job.id });
});

reminderWorker.on("failed", (job, err) => {
  reminderWorkerLog.error("Reminder job failed", { jobId: job?.id, error: err.message });
});

export default reminderWorker;