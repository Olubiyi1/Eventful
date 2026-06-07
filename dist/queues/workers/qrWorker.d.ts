import { Worker } from "bullmq";
import { QrCodeJob } from "../qrQueue";
declare const qrWorker: Worker<QrCodeJob, void, string>;
export default qrWorker;
