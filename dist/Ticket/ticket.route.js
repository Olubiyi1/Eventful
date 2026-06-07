"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("./ticket.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const verifyUserMiddleware_1 = require("../middleware/verifyUserMiddleware");
const restrictTo_1 = require("../middleware/restrictTo");
const rateLimiter_1 = __importDefault(require("../guards/rateLimiter"));
const prisma_1 = require("../../generated/prisma");
const ticketRouter = (0, express_1.Router)();
ticketRouter.get("/my-tickets", rateLimiter_1.default.limiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.EVENTEE]), ticket_controller_1.getMyTickets);
ticketRouter.get("/:id", rateLimiter_1.default.limiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.EVENTEE]), ticket_controller_1.getSingleTicket);
ticketRouter.post("/scan", rateLimiter_1.default.limiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR]), ticket_controller_1.scanTicket);
exports.default = ticketRouter;
//# sourceMappingURL=ticket.route.js.map