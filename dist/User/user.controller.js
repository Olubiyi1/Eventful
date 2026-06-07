"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = exports.loginUser = exports.verifyEmail = exports.registerUser = void 0;
const user_service_1 = __importDefault(require("./user.service"));
const ResponseHandler_1 = __importDefault(require("../utils/ResponseHandler"));
const user_validaton_1 = require("./user.validaton");
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const labels_1 = __importDefault(require("../utils/labels"));
const controllerLog = labels_1.default.createLabel("CONTROLLER");
const registerUser = async (req, res, next) => {
    try {
        const { error, value } = user_validaton_1.registerUserValidationSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const messages = error.details.map((detail) => detail.message);
            controllerLog.warn("User registration validation failed", {
                email: req.body.email,
                errors: messages,
            });
            next(new appError_1.default(messages.join(", "), 400));
            return;
        }
        const result = await user_service_1.default.register(value);
        controllerLog.info("User registration successful", {
            email: result.user.email,
            role: result.user.role,
        });
        ResponseHandler_1.default.created(res, result.message, { user: result.user });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Registration failed", {
                email: req.body?.email,
                reason: err.message,
            });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error during user registration", {
            email: req.body?.email,
            error: err,
        });
        next(new appError_1.default("Something went wrong during registration", 500));
        return;
    }
};
exports.registerUser = registerUser;
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            throw new appError_1.default("Verification token is required", 400);
        }
        const result = await user_service_1.default.verifyEmail(token);
        res.status(200).json({
            status: "success",
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
const loginUser = async (req, res, next) => {
    try {
        const { error, value } = user_validaton_1.loginValidationSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const messages = error.details.map((detail) => detail.message);
            controllerLog.warn("User login validation failed", {
                email: req.body.email,
                errors: messages,
            });
            next(new appError_1.default(messages.join(", "), 400));
            return;
        }
        const result = await user_service_1.default.login(value);
        controllerLog.info("User login successful", {
            email: result.user.email,
            role: result.user.role,
        });
        ResponseHandler_1.default.ok(res, "Login successful", {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: result.expiresAt,
            user: result.user,
        });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Login failed", {
                email: req.body?.email,
                reason: err.message,
            });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error during user login", {
            email: req.body?.email,
            error: err,
        });
        next(new appError_1.default("Something went wrong during login", 500));
    }
};
exports.loginUser = loginUser;
const getMyProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const userId = req.user.id;
        const result = await user_service_1.default.profile(userId);
        controllerLog.info("Profile fetched", { userId });
        ResponseHandler_1.default.ok(res, "Profile fetched successfully", result);
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Profile fetch failed", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error fetching profile", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getMyProfile = getMyProfile;
//# sourceMappingURL=user.controller.js.map