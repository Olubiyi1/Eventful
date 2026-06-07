import { Worker } from "bullmq";
import { ReminderJob } from "../reminderQueue";
declare const reminderWorker: Worker<ReminderJob, void, string>;
export default reminderWorker;
