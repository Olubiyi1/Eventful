"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const guards_1 = __importDefault(require("../guards/guards"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_2 = require("../../generated/prisma");
const emailQueue_1 = require("../queues/emailQueue");
const serviceLog = labels_1.default.createLabel("SERVICE");
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS = 5;
class UserService {
}
_a = UserService;
UserService.register = async (userData) => {
    const { firstName, lastName, password, email, role } = userData;
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        serviceLog.warn(`${email} already exists`, { email, statusCode: 409 });
        throw new appError_1.default("Email already exists", 409);
    }
    const hashPassword = guards_1.default.hashPassword(password);
    const user = await prisma_1.default.user.create({
        data: {
            firstName,
            lastName,
            passwordHash: hashPassword,
            email,
            role: role || prisma_2.Role.EVENTEE,
        },
    });
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma_1.default.verificationToken.create({
        data: {
            userId: user.id,
            token,
            expiresAt,
        },
    });
    await (0, emailQueue_1.addVerificationEmailJob)({
        email: user.email,
        firstName: user.firstName,
        token,
    });
    serviceLog.info(`User registered: ${email}`, { email, role: user.role });
    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            emailVerifiedAt: user.emailVerifiedAt,
        },
        message: "Registration successful! Please check your email to verify your account.",
    };
};
UserService.verifyEmail = async (token) => {
    const verificationToken = await prisma_1.default.verificationToken.findUnique({
        where: { token },
    });
    if (!verificationToken) {
        throw new appError_1.default("Invalid or expired verification token", 400);
    }
    if (verificationToken.expiresAt < new Date()) {
        await prisma_1.default.verificationToken.delete({ where: { token } });
        throw new appError_1.default("Verification token has expired", 400);
    }
    await prisma_1.default.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
    });
    await prisma_1.default.verificationToken.delete({ where: { token } });
    serviceLog.info(`Email verified for userId: ${verificationToken.userId}`);
    return { message: "Email verified successfully. You can now log in." };
};
UserService.login = async (userData) => {
    const { email, password } = userData;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new appError_1.default("Invalid email or password", 401);
    }
    if (!user.emailVerifiedAt) {
        serviceLog.warn("Please verify your email before logging in");
        throw new appError_1.default("Please verify your email before logging in", 403);
    }
    const isPasswordMatch = await guards_1.default.comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
        throw new appError_1.default("Invalid email or password", 401);
    }
    const accessToken = guards_1.default.createAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const { refreshToken, hashedToken } = guards_1.default.createRefreshToken();
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
    // prune expired token and enforce session cap
    await prisma_1.default.refreshToken.deleteMany({
        where: {
            userId: user.id,
            expiresAt: { lt: new Date() },
        },
    });
    const activeSessions = await prisma_1.default.refreshToken.count({
        where: { userId: user.id },
    });
    if (activeSessions >= MAX_SESSIONS) {
        // delete oldest session
        const oldest = await prisma_1.default.refreshToken.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
        });
        if (oldest) {
            await prisma_1.default.refreshToken.delete({ where: { id: oldest.id } });
        }
    }
    // save new refresh token
    await prisma_1.default.refreshToken.create({
        data: {
            userId: user.id,
            token: hashedToken,
            expiresAt: refreshTokenExpiresAt,
        },
    });
    serviceLog.info(`User logged in: ${email}`, { email });
    return {
        accessToken,
        refreshToken,
        expiresAt: refreshTokenExpiresAt,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            emailVerifiedAt: user.emailVerifiedAt,
        },
    };
};
UserService.profile = async (userId) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new appError_1.default("user not found", 404);
    }
    serviceLog.info(`Profile fetched ${user.email}`, { userId });
    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            emailVerifiedAt: user.emailVerifiedAt,
            createdAt: user.createdAt,
        },
    };
};
exports.default = UserService;
//# sourceMappingURL=user.service.js.map