"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../user.service"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const guards_1 = __importDefault(require("../../guards/guards"));
const appError_1 = __importDefault(require("../../errorHandlers/appError"));
const prisma_2 = require("../../../generated/prisma");
jest.mock("../../config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    refreshToken: {
        deleteMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
}));
jest.mock("../../guards/guards");
jest.mock("../../utils/labels", () => ({
    __esModule: true,
    default: {
        createLabel: () => ({
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        }),
    },
}));
// ---- REGISTER TESTS ----
describe("UserService.register", () => {
    const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@gmail.com",
        password: "Password@123",
        role: prisma_2.Role.EVENTEE,
    };
    it("should throw 409 if email already exists", async () => {
        prisma_1.default.user.findUnique.mockResolvedValue({ id: "123", email: userData.email });
        await expect(user_service_1.default.register(userData)).rejects.toThrow(appError_1.default);
        await expect(user_service_1.default.register(userData)).rejects.toMatchObject({
            statusCode: 409,
        });
    });
    it("should register a user successfully", async () => {
        prisma_1.default.user.findUnique.mockResolvedValue(null);
        guards_1.default.hashPassword.mockReturnValue("hashedpassword");
        prisma_1.default.user.create.mockResolvedValue({
            id: "123",
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: prisma_2.Role.EVENTEE,
            emailVerifiedAt: null,
        });
        const result = await user_service_1.default.register(userData);
        expect(result.message).toBe("Registration successful!");
        expect(result.user.email).toBe(userData.email);
        expect(result.user.role).toBe(prisma_2.Role.EVENTEE);
    });
    it("should default role to EVENTEE if no role is provided", async () => {
        const { role, ...userDataWithoutRole } = userData;
        prisma_1.default.user.findUnique.mockResolvedValue(null);
        guards_1.default.hashPassword.mockReturnValue("hashedpassword");
        prisma_1.default.user.create.mockResolvedValue({
            id: "123",
            ...userDataWithoutRole,
            role: prisma_2.Role.EVENTEE,
            emailVerifiedAt: null,
        });
        const result = await user_service_1.default.register(userDataWithoutRole);
        expect(result.user.role).toBe(prisma_2.Role.EVENTEE);
    });
});
// ---- LOGIN TESTS ----
describe("UserService.login", () => {
    const loginData = {
        email: "john@gmail.com",
        password: "Password@123",
    };
    const mockUser = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: loginData.email,
        passwordHash: "hashedpassword",
        role: prisma_2.Role.EVENTEE,
        emailVerifiedAt: new Date(),
    };
    it("should throw 401 if user does not exist", async () => {
        prisma_1.default.user.findUnique.mockResolvedValue(null);
        await expect(user_service_1.default.login(loginData)).rejects.toMatchObject({
            statusCode: 401,
        });
    });
    it("should throw 401 if password does not match", async () => {
        prisma_1.default.user.findUnique.mockResolvedValue(mockUser);
        guards_1.default.comparePassword.mockResolvedValue(false);
        await expect(user_service_1.default.login(loginData)).rejects.toMatchObject({
            statusCode: 401,
        });
    });
    it("should login successfully and return tokens", async () => {
        prisma_1.default.user.findUnique.mockResolvedValue(mockUser);
        guards_1.default.comparePassword.mockResolvedValue(true);
        guards_1.default.createAccessToken.mockReturnValue("access_token");
        guards_1.default.createRefreshToken.mockReturnValue({
            refreshToken: "refresh_token",
            hashedToken: "hashed_refresh_token",
        });
        prisma_1.default.refreshToken.deleteMany.mockResolvedValue({});
        prisma_1.default.refreshToken.count.mockResolvedValue(0);
        prisma_1.default.refreshToken.create.mockResolvedValue({});
        const result = await user_service_1.default.login(loginData);
        expect(result.accessToken).toBe("access_token");
        expect(result.refreshToken).toBe("refresh_token");
        expect(result.user.email).toBe(loginData.email);
    });
});
//# sourceMappingURL=user.service.test.js.map