"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const verifyUserMiddleware_1 = require("../middleware/verifyUserMiddleware");
const restrictTo_1 = require("../middleware/restrictTo");
const rateLimiter_1 = __importDefault(require("../guards/rateLimiter"));
const prisma_1 = require("../../generated/prisma");
const analyticsRouter = (0, express_1.Router)();
analyticsRouter.get("/overall", rateLimiter_1.default.limiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR]), analytics_controller_1.getOverallAnalytics);
analyticsRouter.get("/event/:id", rateLimiter_1.default.limiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR]), analytics_controller_1.getEventAnalytics);
exports.default = analyticsRouter;
//# sourceMappingURL=analytics.routes.js.map