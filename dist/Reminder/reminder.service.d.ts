import { ReminderOffset } from "../../generated/prisma";
declare class ReminderService {
    static createReminder: (userId: string, eventId: string, offset?: ReminderOffset) => Promise<void>;
    static updateReminder: (userId: string, eventId: string, offset: ReminderOffset) => Promise<void>;
}
export default ReminderService;
