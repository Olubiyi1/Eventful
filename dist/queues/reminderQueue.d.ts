import { Queue } from "bullmq";
export interface ReminderJob {
    userId: string;
    eventId: string;
    email: string;
    firstName: string;
    eventTitle: string;
    eventDate: Date;
    eventLocation: string;
}
export declare const reminderQueue: Queue<any, any, string, any, any, string>;
export declare const addReminderJob: (data: ReminderJob, remindAt: Date) => Promise<void>;
