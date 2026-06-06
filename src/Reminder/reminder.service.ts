import prisma from "../config/prisma";
import Labels from "../utils/labels";
import AppError from "../errorHandlers/appError";
import { ReminderOffset } from "../../generated/prisma";
import { addReminderJob } from "../queues/reminderQueue";

const reminderServiceLogs = Labels.createLabel("SERVICE");

const calculateRemindAt = (eventDate: Date, offset: ReminderOffset): Date => {
  const remindAt = new Date(eventDate);

  switch (offset) {
    case ReminderOffset.ONE_HOUR_BEFORE:
      remindAt.setHours(remindAt.getHours() - 1);
      break;
    case ReminderOffset.THREE_HOURS_BEFORE:
      remindAt.setHours(remindAt.getHours() - 3);
      break;
    case ReminderOffset.ONE_DAY_BEFORE:
      remindAt.setDate(remindAt.getDate() - 1);
      break;
    case ReminderOffset.THREE_DAYS_BEFORE:
      remindAt.setDate(remindAt.getDate() - 3);
      break;
    case ReminderOffset.ONE_WEEK_BEFORE:
      remindAt.setDate(remindAt.getDate() - 7);
      break;
  }

  return remindAt;
};

class ReminderService {
  static createReminder = async (
    userId: string,
    eventId: string,
    offset?: ReminderOffset
  ): Promise<void> => {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: { select: { firstName: true } },
      },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const reminderOffset = offset || event.defaultReminder;
    const remindAt = calculateRemindAt(event.eventDate, reminderOffset);

    const reminder = await prisma.reminder.upsert({
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

    await addReminderJob(
      {
        userId,
        eventId,
        email: user.email,
        firstName: user.firstName,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventLocation: event.location,
      },
      remindAt
    );

    reminderServiceLogs.info("Reminder created", { userId, eventId, remindAt });
  };

  static updateReminder = async (
    userId: string,
    eventId: string,
    offset: ReminderOffset
  ): Promise<void> => {
    const reminder = await prisma.reminder.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!reminder) {
      throw new AppError("Reminder not found", 404);
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const remindAt = calculateRemindAt(event.eventDate, offset);

    await prisma.reminder.update({
      where: { userId_eventId: { userId, eventId } },
      data: { remindAt, customOffset: offset, sent: false },
    });

    await addReminderJob(
      {
        userId,
        eventId,
        email: user.email,
        firstName: user.firstName,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventLocation: event.location,
      },
      remindAt
    );

    reminderServiceLogs.info("Reminder updated", { userId, eventId, remindAt });
  };
}

export default ReminderService;