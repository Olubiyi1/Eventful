declare class RateLimiter {
    static limiter: import("express-rate-limit").RateLimitRequestHandler;
    static registerLimiter: import("express-rate-limit").RateLimitRequestHandler;
    static loginLimiter: import("express-rate-limit").RateLimitRequestHandler;
    static verifyEmailLimiter: import("express-rate-limit").RateLimitRequestHandler;
    static createEventLimiter: import("express-rate-limit").RateLimitRequestHandler;
    static updateEventLimiter: import("express-rate-limit").RateLimitRequestHandler;
    static deleteEventLimiter: import("express-rate-limit").RateLimitRequestHandler;
}
export default RateLimiter;
