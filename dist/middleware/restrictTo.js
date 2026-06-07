"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = void 0;
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const restrictTo = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            next(new appError_1.default("You are not logged in", 401));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(new appError_1.default("You do not have permission to perform this action", 403));
            return;
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=restrictTo.js.map