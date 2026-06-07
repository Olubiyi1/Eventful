import { Queue } from "bullmq";
export interface VerificationEmailJob {
    email: string;
    firstName: string;
    token: string;
}
export declare const emailQueue: Queue<any, any, string, any, any, string>;
export declare const addVerificationEmailJob: (data: VerificationEmailJob) => Promise<void>;
