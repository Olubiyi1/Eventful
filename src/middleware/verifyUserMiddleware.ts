import { Response, NextFunction } from "express";
import AppError from "../errorHandlers/appError";
import prisma from "../config/prisma";
import Labels from "../utils/labels";
import { AuthRequest } from "../types/express";

const authLog = Labels.createLabel("AUTH");

export const verifyLoggedInUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }
    if (!req.user.emailVerifiedAt) {
      next(new AppError("Please verify your email to access this route", 403));
      return;
    }
    next();
  } catch (err) {
    next(new AppError("Something went wrong", 500));
  }
};

export const verifyUserByEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      next(new AppError("Email is required", 400));
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt ?? undefined,
    };

    authLog.info("User verified by email", { email });
    next();
  } catch (err) {
    next(new AppError("Something went wrong", 500));
  }
};