"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("./event.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const verifyUserMiddleware_1 = require("../middleware/verifyUserMiddleware");
const restrictTo_1 = require("../middleware/restrictTo");
const rateLimiter_1 = __importDefault(require("../guards/rateLimiter"));
const prisma_1 = require("../../generated/prisma");
const eventRouter = (0, express_1.Router)();
// public routes
// public routes
eventRouter.get("/", rateLimiter_1.default.limiter, event_controller_1.getAllEvents);
eventRouter.get("/my-events", authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR]), event_controller_1.getCreatorEvents); // ← before /:id
eventRouter.get("/:id", rateLimiter_1.default.limiter, event_controller_1.getSingleEvent);
// protected routes — CREATOR only
eventRouter.post("/", rateLimiter_1.default.createEventLimiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR]), event_controller_1.createEvent);
eventRouter.patch("/:id", rateLimiter_1.default.updateEventLimiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR]), event_controller_1.updateEvent);
eventRouter.delete("/:id", rateLimiter_1.default.deleteEventLimiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR]), event_controller_1.deleteEvent);
exports.default = eventRouter;
//# sourceMappingURL=event.route.js.map