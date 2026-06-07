"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const rateLimiter_1 = __importDefault(require("../guards/rateLimiter"));
const verifyUserMiddleware_1 = require("../middleware/verifyUserMiddleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
const restrictTo_1 = require("../middleware/restrictTo");
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const prisma_1 = require("../../generated/prisma");
const user_validaton_1 = require("./user.validaton");
const userRouter = (0, express_1.Router)();
userRouter.post("/register", rateLimiter_1.default.registerLimiter, (0, validationMiddleware_1.default)(user_validaton_1.registerUserValidationSchema), user_controller_1.registerUser);
userRouter.post("/login", rateLimiter_1.default.loginLimiter, (0, validationMiddleware_1.default)(user_validaton_1.loginValidationSchema), user_controller_1.loginUser);
userRouter.get("/verify-email", user_controller_1.verifyEmail);
userRouter.get("/me", authMiddleware_1.authMiddleware, verifyUserMiddleware_1.verifyLoggedInUser, (0, restrictTo_1.restrictTo)([prisma_1.Role.CREATOR, prisma_1.Role.EVENTEE]), user_controller_1.getMyProfile);
exports.default = userRouter;
//# sourceMappingURL=user.routes.js.map