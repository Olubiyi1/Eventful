"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        const errorMessages = error.details.map((detail) => detail.message).join(", ");
        next(new appError_1.default(errorMessages, 400));
        return;
    }
    req.body = value;
    next();
};
exports.default = validate;
//# sourceMappingURL=validationMiddleware.js.map