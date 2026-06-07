"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reminder_controller_1 = require("./reminder.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const verifyUserMiddleware_1 = require("../middleware/verifyUserMiddleware");
const restrictTo_1 = require("../middleware/restrictTo");
const rateLimiter_1 = __importDefault(require("../guards/rateLimiter"));
const prisma_1 = require("../../generated/prisma");
const reminderRouter = (0, express_1.Router)();
reminderRouter.patch("/", rateLimiter_1.default.limiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.EVENTEE]), reminder_controller_1.updateReminder);
exports.default = reminderRouter;
//# sourceMappingURL=reminder.routes.js.map