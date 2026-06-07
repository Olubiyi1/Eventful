"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitAfterFlush = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
winston_1.default.addColors({
    info: "blue",
    warn: "yellow",
    error: "red",
    debug: "gray",
});
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
}), winston_1.default.format.printf((info) => {
    const label = info["label"] || "EVENTFUL";
    return `${info.timestamp} [${info.level.toUpperCase()}] [${label}] ${info.message}`;
}));
exports.logger = winston_1.default.createLogger({
    level: "info",
    transports: [
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
    ],
    exitOnError: false,
});
// Graceful shutdown
const exitAfterFlush = async () => {
    exports.logger.close();
    await new Promise((resolve) => setTimeout(resolve, 2000));
};
exports.exitAfterFlush = exitAfterFlush;
//# sourceMappingURL=logger.js.map