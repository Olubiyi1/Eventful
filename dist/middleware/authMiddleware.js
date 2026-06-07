"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const guards_1 = __importDefault(require("../guards/guards"));
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const authLog = labels_1.default.createLabel("AUTH");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            next(new appError_1.default("Unauthorized: No token provided", 401));
            return;
        }
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = guards_1.default.verifyAccessToken(token);
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
                next(new appError_1.default("Session expired. Please log in again", 401));
                return;
            }
            next(new appError_1.default("Invalid token. Please log in again", 401));
            return;
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            next(new appError_1.default("User no longer exists", 401));
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerifiedAt: user.emailVerifiedAt ?? undefined,
        };
        authLog.info("User authenticated", { userId: user.id });
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map