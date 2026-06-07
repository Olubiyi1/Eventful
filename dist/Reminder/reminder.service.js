"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const prisma_2 = require("../../generated/prisma");
const reminderQueue_1 = require("../queues/reminderQueue");
const reminderServiceLogs = labels_1.default.createLabel("SERVICE");
const calculateRemindAt = (eventDate, offset) => {
    const remindAt = new Date(eventDate);
    switch (offset) {
        case prisma_2.ReminderOffset.ONE_HOUR_BEFORE:
            remindAt.setHours(remindAt.getHours() - 1);
            break;
        case prisma_2.ReminderOffset.THREE_HOURS_BEFORE:
            remindAt.setHours(remindAt.getHours() - 3);
            break;
        case prisma_2.ReminderOffset.ONE_DAY_BEFORE:
            remindAt.setDate(remindAt.getDate() - 1);
            break;
        case prisma_2.ReminderOffset.THREE_DAYS_BEFORE:
            remindAt.setDate(remindAt.getDate() - 3);
            break;
        case prisma_2.ReminderOffset.ONE_WEEK_BEFORE:
            remindAt.setDate(remindAt.getDate() - 7);
            break;
    }
    return remindAt;
};
class ReminderService {
}
_a = ReminderService;
ReminderService.createReminder = async (userId, eventId, offset) => {
    const event = await prisma_1.default.event.findUnique({
        where: { id: eventId },
        include: {
            creator: { select: { firstName: true } },
        },
    });
    if (!event) {
        throw new appError_1.default("Event not found", 404);
    }
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new appError_1.default("User not found", 404);
    }
    const reminderOffset = offset || event.defaultReminder;
    const remindAt = calculateRemindAt(event.eventDate, reminderOffset);
    const reminder = await prisma_1.default.reminder.upsert({
        where: { userId_eventId: { userId, eventId } },
        update: {
            remindAt,
            customOffset: offset || null,
            sent: false,
        },
        create: {
            userId,
            eventId,
            remindAt,
            customOffset: offset || null,
        },
    });
    await (0, reminderQueue_1.addReminderJob)({
        userId,
        eventId,
        email: user.email,
        firstName: user.firstName,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventLocation: event.location,
    }, remindAt);
    reminderServiceLogs.info("Reminder created", { userId, eventId, remindAt });
};
ReminderService.updateReminder = async (userId, eventId, offset) => {
    const reminder = await prisma_1.default.reminder.findUnique({
        where: { userId_eventId: { userId, eventId } },
    });
    if (!reminder) {
        throw new appError_1.default("Reminder not found", 404);
    }
    const event = await prisma_1.default.event.findUnique({ where: { id: eventId } });
    if (!event) {
        throw new appError_1.default("Event not found", 404);
    }
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new appError_1.default("User not found", 404);
    }
    const remindAt = calculateRemindAt(event.eventDate, offset);
    await prisma_1.default.reminder.update({
        where: { userId_eventId: { userId, eventId } },
        data: { remindAt, customOffset: offset, sent: false },
    });
    await (0, reminderQueue_1.addReminderJob)({
        userId,
        eventId,
        email: user.email,
        firstName: user.firstName,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventLocation: event.location,
    }, remindAt);
    reminderServiceLogs.info("Reminder updated", { userId, eventId, remindAt });
};
exports.default = ReminderService;
//# sourceMappingURL=reminder.service.js.map