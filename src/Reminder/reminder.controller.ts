import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import ReminderService from "./reminder.service";
import ResponseHandler from "../utils/ResponseHandler";
import AppError from "../errorHandlers/appError";
import Labels from "../utils/labels";
import { ReminderOffset } from "../../generated/prisma";

const reminderControllerLogs = Labels.createLabel("REMINDER_CONTROLLER");

export const updateReminder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const { eventId, offset } = req.body;

    if (!eventId || !offset) {
      next(new AppError("Event ID and offset are required", 400));
      return;
    }

    if (!Object.values(ReminderOffset).includes(offset)) {
      next(new AppError("Invalid reminder offset", 400));
      return;
    }

    await ReminderService.updateReminder(req.user.id, eventId, offset);

    reminderControllerLogs.info("Reminder updated", {
      userId: req.user.id,
      eventId,
      offset,
    });

    ResponseHandler.ok(res, "Reminder updated successfully", {});
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      reminderControllerLogs.warn("Reminder update failed", { reason: err.message });
      next(err);
      return;
    }
    reminderControllerLogs.error("Unexpected error updating reminder", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};