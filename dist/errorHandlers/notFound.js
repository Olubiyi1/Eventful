"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const appError_1 = __importDefault(require("./appError"));
const notFoundHandler = (req, res, next) => {
    const err = new appError_1.default(`Can't find ${req.originalUrl}`, 404);
    next(err);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFound.js.map