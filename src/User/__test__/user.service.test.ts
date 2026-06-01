import UserService from "../user.service";
import prisma from "../../config/prisma";
import Guards from "../../guards/guards";
import AppError from "../../errorHandlers/appError";
import { Role } from "../../../generated/prisma";

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
    role: Role.EVENTEE,
  };

  it("should throw 409 if email already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "123", email: userData.email });

    await expect(UserService.register(userData)).rejects.toThrow(AppError);
    await expect(UserService.register(userData)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("should register a user successfully", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (Guards.hashPassword as jest.Mock).mockReturnValue("hashedpassword");
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "123",
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: Role.EVENTEE,
      emailVerifiedAt: null,
    });

    const result = await UserService.register(userData);

    expect(result.message).toBe("Registration successful!");
    expect(result.user.email).toBe(userData.email);
    expect(result.user.role).toBe(Role.EVENTEE);
  });

  it("should default role to EVENTEE if no role is provided", async () => {
    const { role, ...userDataWithoutRole } = userData;

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (Guards.hashPassword as jest.Mock).mockReturnValue("hashedpassword");
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "123",
      ...userDataWithoutRole,
      role: Role.EVENTEE,
      emailVerifiedAt: null,
    });

    const result = await UserService.register(userDataWithoutRole);
    expect(result.user.role).toBe(Role.EVENTEE);
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
    role: Role.EVENTEE,
    emailVerifiedAt: new Date(),
  };

  it("should throw 401 if user does not exist", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(UserService.login(loginData)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("should throw 401 if password does not match", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (Guards.comparePassword as jest.Mock).mockResolvedValue(false);

    await expect(UserService.login(loginData)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("should login successfully and return tokens", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (Guards.comparePassword as jest.Mock).mockResolvedValue(true);
    (Guards.createAccessToken as jest.Mock).mockReturnValue("access_token");
    (Guards.createRefreshToken as jest.Mock).mockReturnValue({
      refreshToken: "refresh_token",
      hashedToken: "hashed_refresh_token",
    });
    (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({});
    (prisma.refreshToken.count as jest.Mock).mockResolvedValue(0);
    (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

    const result = await UserService.login(loginData);

    expect(result.accessToken).toBe("access_token");
    expect(result.refreshToken).toBe("refresh_token");
    expect(result.user.email).toBe(loginData.email);
  });
});