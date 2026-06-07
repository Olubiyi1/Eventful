"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserByEmail = exports.verifyLoggedInUser = void 0;
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const authLog = labels_1.default.createLabel("AUTH");
const verifyLoggedInUser = (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Authentication required", 401));
            return;
        }
        if (!req.user.emailVerifiedAt) {
            next(new appError_1.default("Please verify your email to access this route", 403));
            return;
        }
        next();
    }
    catch (err) {
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.verifyLoggedInUser = verifyLoggedInUser;
const verifyUserByEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            next(new appError_1.default("Email is required", 400));
            return;
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            next(new appError_1.default("User not found", 404));
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerifiedAt: user.emailVerifiedAt ?? undefined,
        };
        authLog.info("User verified by email", { email });
        next();
    }
    catch (err) {
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.verifyUserByEmail = verifyUserByEmail;
//# sourceMappingURL=verifyUserMiddleware.js.map