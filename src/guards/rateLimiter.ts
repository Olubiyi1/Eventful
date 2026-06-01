import rateLimit, { Options } from "express-rate-limit";
import { Request } from "express";

const getIp = (req: Request): string => {
  return (req.ip ?? req.socket.remoteAddress ?? "unknown");
};

const getEmailOrIp = (req: Request): string => {
  const email = req.body?.email?.toLowerCase().trim();
  return email || getIp(req);
};

const baseConfig: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
};

class RateLimiter {
  static limiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
    keyGenerator: (req: Request): string => getIp(req),
  });


  static registerLimiter = rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many registration attempts, please try again later",
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request): string => getIp(req),
  });

  static loginLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later",
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request): string => {
      const email = req.body?.email?.toLowerCase().trim();
      return email ? `${email}-${getIp(req)}` : getIp(req);
    },
  });

  static verifyEmailLimiter = rateLimit({
    ...baseConfig,
    windowMs: 30 * 60 * 1000,
    max: 10,
    message: "Too many verification attempts, please try again later",
    keyGenerator: (req: Request): string => getEmailOrIp(req),
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
  static createEventLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many event creation attempts, please try again later",
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request): string => getIp(req),
});

static updateEventLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many event update attempts, please try again later",
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request): string => getIp(req),
});

static deleteEventLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many event deletion attempts, please try again later",
  keyGenerator: (req: Request): string => getIp(req),
});
}

export default RateLimiter;