"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("./paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const verifyUserMiddleware_1 = require("../middleware/verifyUserMiddleware");
const restrictTo_1 = require("../middleware/restrictTo");
const rateLimiter_1 = __importDefault(require("../guards/rateLimiter"));
const prisma_1 = require("../../generated/prisma");
const express_2 = __importDefault(require("express"));
const paymentRouter = (0, express_1.Router)();
// webhook must use raw body — must be before express.json()
paymentRouter.post("/webhook", express_2.default.raw({ type: "application/json" }), paymentController_1.handleWebhook);
// initialize payment — authenticated eventees only
paymentRouter.post("/initialize", rateLimiter_1.default.limiter, authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.EVENTEE]), paymentController_1.initializePayment);
// verify payment — called by Paystack redirect
paymentRouter.get("/verify", paymentController_1.verifyPayment);
exports.default = paymentRouter;
//# sourceMappingURL=payment.route.js.map