import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../connection";
import { VerificationEmailJob } from "../emailQueue";
import emailTransporter from "../../helpers/emailTransporter";
import Labels from "../../utils/labels";

const workerLog = Labels.createLabel("WORKER");


const processEmailJob = async (job: Job<VerificationEmailJob>): Promise<void> => {
  const { email, firstName, token } = job.data;

  const verificationUrl = `${process.env.APP_URL}/api/v1/users/verify-email?token=${token}`;

  await emailTransporter.sendMail({
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

  workerLog.info("Verification email sent", { email });
};

const emailWorker = new Worker("email", processEmailJob, {
  connection: redisConnectionOptions,
});

emailWorker.on("completed", (job) => {
  workerLog.info("Email job completed", { jobId: job.id });
});

emailWorker.on("failed", (job, err) => {
  workerLog.error("Email job failed", { jobId: job?.id, error: err.message });
});

export default emailWorker;