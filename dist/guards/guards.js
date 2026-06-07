"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config/config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class Guards {
}
_a = Guards;
Guards.createAccessToken = (user) => {
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    }, config_1.default.secret_key, { expiresIn: "15m" });
    return token;
};
Guards.createRefreshToken = () => {
    const refreshToken = crypto_1.default.randomBytes(64).toString("hex");
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
    return { refreshToken, hashedToken };
};
Guards.hashPassword = (password) => {
    return bcrypt_1.default.hashSync(password, 10);
};
Guards.comparePassword = async (password, hashPassword) => {
    return await bcrypt_1.default.compare(password, hashPassword);
};
Guards.verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.secret_key);
};
exports.default = Guards;
//# sourceMappingURL=guards.js.map