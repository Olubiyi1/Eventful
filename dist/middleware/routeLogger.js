"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const labels_1 = __importDefault(require("../utils/labels"));
const routeLog = labels_1.default.createLabel("ROUTE");
const routeLogger = (req, res, next) => {
    // Record when the request started
    const start = Date.now();
    // Log that request came in
    routeLog.info(`Incoming: ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: (req.headers["x-forwarded-for"] || req.ip || "")
            .split(",")[0]
            .trim(),
    });
    // Set up a listener for when response finishes
    res.on("finish", () => {
        const duration = Date.now() - start;
        routeLog.info(`Completed: ${req.method} ${req.url}`, {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: (req.headers["x-forwarded-for"] || req.ip || "")
                .split(",")[0]
                .trim(),
        });
    });
    next();
};
exports.default = routeLogger;
//# sourceMappingURL=routeLogger.js.map