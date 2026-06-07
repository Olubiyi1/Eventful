"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidationSchema = exports.resendVerificationValidationSchema = exports.resetPasswordValidationSchema = exports.forgotPasswordValidationSchema = exports.loginValidationSchema = exports.registerUserValidationSchema = void 0;
const validationMessages_1 = require("../utils/validationMessages");
const joi_1 = __importDefault(require("joi"));
// user registration
exports.registerUserValidationSchema = joi_1.default.object({
    firstName: joi_1.default.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages(validationMessages_1.validationMessages.firstname),
    lastName: joi_1.default.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages(validationMessages_1.validationMessages.lastname),
    email: joi_1.default.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .required()
        .messages(validationMessages_1.validationMessages.email),
    password: joi_1.default.string()
        .trim()
        .min(8)
        .max(30)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"))
        .required()
        .messages(validationMessages_1.validationMessages.password),
    role: joi_1.default.string()
        .valid("EVENTEE", "CREATOR")
        .optional()
        .messages(validationMessages_1.validationMessages.role),
});
// user login
exports.loginValidationSchema = joi_1.default.object({
    email: joi_1.default.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .required()
        .messages(validationMessages_1.validationMessages.email),
    password: joi_1.default.string()
        .trim()
        .required()
        .messages(validationMessages_1.validationMessages.password),
});
// user login
exports.forgotPasswordValidationSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .required()
        .messages(validationMessages_1.validationMessages.email),
});
exports.resetPasswordValidationSchema = joi_1.default.object({
    newPassword: joi_1.default.string()
        .min(8)
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
        .messages(validationMessages_1.validationMessages.password),
    confirmPassword: joi_1.default.string()
        .valid(joi_1.default.ref("newPassword"))
        .required()
        .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
    }),
});
// resend verifcation message
exports.resendVerificationValidationSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages(validationMessages_1.validationMessages.email),
});
// change password
exports.changePasswordValidationSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required().messages({
        "any.required": "Current password is required",
    }),
    newPassword: joi_1.default.string()
        .min(8)
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
        .messages(validationMessages_1.validationMessages.password),
    confirmPassword: joi_1.default.string()
        .valid(joi_1.default.ref("newPassword"))
        .required()
        .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
    }),
});
//# sourceMappingURL=user.validaton.js.map