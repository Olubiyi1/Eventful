import prisma from "../config/prisma";
import Labels from "../utils/labels";
import AppError from "../errorHandlers/appError";
import Guards from "../guards/guards";
import crypto from "crypto";
import { Role } from "../../generated/prisma";
import { addVerificationEmailJob } from "../queues/emailQueue";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    emailVerifiedAt: Date | null;
  };
  message: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    emailVerifiedAt: Date | null;
  };
}

interface ProfileResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    emailVerifiedAt: Date | null;
    createdAt: Date;
  };
}

const serviceLog = Labels.createLabel("SERVICE");

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS = 5;

class UserService {
  static register = async (userData: UserData): Promise<RegisterResponse> => {
    const { firstName, lastName, password, email, role } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      serviceLog.warn(`${email} already exists`, { email, statusCode: 409 });
      throw new AppError("Email already exists", 409);
    }

    const hashPassword = Guards.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        passwordHash: hashPassword,
        email,
        role: role || Role.EVENTEE,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await addVerificationEmailJob({
      email: user.email,
      firstName: user.firstName,
      token,
    });

    serviceLog.info(`User registered: ${email}`, { email, role: user.role });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      message:
        "Registration successful! Please check your email to verify your account.",
    };
  };

  static verifyEmail = async (token: string): Promise<{ message: string }> => {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    throw new AppError("Verification token has expired", 400);
  }

  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerifiedAt: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  serviceLog.info(`Email verified for userId: ${verificationToken.userId}`);

  return { message: "Email verified successfully. You can now log in." };
};

  static login = async (userData: LoginData): Promise<LoginResponse> => {
    const { email, password } = userData;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.emailVerifiedAt) {
      serviceLog.warn("Please verify your email before logging in")
      throw new AppError("Please verify your email before logging in", 403);
    }
    const isPasswordMatch = await Guards.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = Guards.createAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { refreshToken, hashedToken } = Guards.createRefreshToken();
    const refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_MS,
    );

    // prune expired token and enforce session cap
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    });
    const activeSessions = await prisma.refreshToken.count({
      where: { userId: user.id },
    });

    if (activeSessions >= MAX_SESSIONS) {
      // delete oldest session
      const oldest = await prisma.refreshToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) {
        await prisma.refreshToken.delete({ where: { id: oldest.id } });
      }
    }
    // save new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    serviceLog.info(`User logged in: ${email}`, { email });

    return {
      accessToken,
      refreshToken,
      expiresAt: refreshTokenExpiresAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  };

  static profile = async (userId: string): Promise<ProfileResponse> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("user not found", 404);
    }
    serviceLog.info(`Profile fetched ${user.email}`, { userId });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
      },
    };
  };
}

export default UserService;
