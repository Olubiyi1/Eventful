"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReminder = void 0;
const reminder_service_1 = __importDefault(require("./reminder.service"));
const ResponseHandler_1 = __importDefault(require("../utils/ResponseHandler"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const labels_1 = __importDefault(require("../utils/labels"));
const prisma_1 = require("../../generated/prisma");
const reminderControllerLogs = labels_1.default.createLabel("REMINDER_CONTROLLER");
const updateReminder = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const { eventId, offset } = req.body;
        if (!eventId || !offset) {
            next(new appError_1.default("Event ID and offset are required", 400));
            return;
        }
        if (!Object.values(prisma_1.ReminderOffset).includes(offset)) {
            next(new appError_1.default("Invalid reminder offset", 400));
            return;
        }
        await reminder_service_1.default.updateReminder(req.user.id, eventId, offset);
        reminderControllerLogs.info("Reminder updated", {
            userId: req.user.id,
            eventId,
            offset,
        });
        ResponseHandler_1.default.ok(res, "Reminder updated successfully", {});
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            reminderControllerLogs.warn("Reminder update failed", { reason: err.message });
            next(err);
            return;
        }
        reminderControllerLogs.error("Unexpected error updating reminder", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.updateReminder = updateReminder;
//# sourceMappingURL=reminder.controller.js.map