import { Queue } from "bullmq";
export interface QrCodeJob {
    ticketId: string;
    userId: string;
    eventId: string;
    email: string;
    firstName: string;
    qrUuid: string;
}
export declare const qrQueue: Queue<any, any, string, any, any, string>;
export declare const addQrCodeJob: (data: QrCodeJob) => Promise<void>;
