import { Worker } from "bullmq";
import { VerificationEmailJob } from "../emailQueue";
declare const emailWorker: Worker<VerificationEmailJob, void, string>;
export default emailWorker;
