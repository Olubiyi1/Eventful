"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const getIp = (req) => {
    return (req.ip ?? req.socket.remoteAddress ?? "unknown");
};
const getEmailOrIp = (req) => {
    const email = req.body?.email?.toLowerCase().trim();
    return email || getIp(req);
};
const baseConfig = {
    standardHeaders: true,
    legacyHeaders: false,
};
class RateLimiter {
}
RateLimiter.limiter = (0, express_rate_limit_1.default)({
    ...baseConfig,
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
    keyGenerator: (req) => getIp(req),
});
RateLimiter.registerLimiter = (0, express_rate_limit_1.default)({
    ...baseConfig,
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many registration attempts, please try again later",
    skipSuccessfulRequests: true,
    keyGenerator: (req) => getIp(req),
});
RateLimiter.loginLimiter = (0, express_rate_limit_1.default)({
    ...baseConfig,
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later",
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const email = req.body?.email?.toLowerCase().trim();
        return email ? `${email}-${getIp(req)}` : getIp(req);
    },
});
RateLimiter.verifyEmailLimiter = (0, express_rate_limit_1.default)({
    ...baseConfig,
    windowMs: 30 * 60 * 1000,
    max: 10,
    message: "Too many verification attempts, please try again later",
    keyGenerator: (req) => getEmailOrIp(req),
});
// static resendVerificationLimiter = rateLimit({
//   ...baseConfig,
//   windowMs: 30 * 60 * 1000,
//   max: 3,
//   message: "Too many verification email requests, please try again later",
//   keyGenerator: (req: Request): string => getEmailOrIp(req),
// });
// static forgotPasswordLimiter = rateLimit({
//   ...baseConfig,
//   windowMs: 30 * 60 * 1000,
//   max: 3,
//   message: "Too many password reset requests, please try again later",
//   keyGenerator: (req: Request): string => getEmailOrIp(req),
// });
// static resetPasswordLimiter = rateLimit({
//   ...baseConfig,
//   windowMs: 30 * 60 * 1000,
//   max: 5,
//   message: "Too many password reset attempts, please try again later",
//   keyGenerator: (req: Request): string => getEmailOrIp(req),
// });
RateLimiter.createEventLimiter = (0, express_rate_limit_1.default)({
    ...baseConfig,
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: "Too many event creation attempts, please try again later",
    skipSuccessfulRequests: true,
    keyGenerator: (req) => getIp(req),
});
RateLimiter.updateEventLimiter = (0, express_rate_limit_1.default)({
    ...baseConfig,
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many event update attempts, please try again later",
    skipSuccessfulRequests: true,
    keyGenerator: (req) => getIp(req),
});
RateLimiter.deleteEventLimiter = (0, express_rate_limit_1.default)({
    ...baseConfig,
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many event deletion attempts, please try again later",
    keyGenerator: (req) => getIp(req),
});
exports.default = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map