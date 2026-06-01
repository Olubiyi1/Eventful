import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../errorHandlers/appError";
import Guards, { JwtPayload } from "../guards/guards";
import prisma from "../config/prisma";
import Labels from "../utils/labels";
import { AuthRequest } from "../types/express";

const authLog = Labels.createLabel("AUTH");

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next(new AppError("Unauthorized: No token provided", 401));
      return;
    }

    const token = authHeader.split(" ")[1];

    let decoded: JwtPayload;
    try {
      decoded = Guards.verifyAccessToken(token);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        next(new AppError("Session expired. Please log in again", 401));
        return;
      }
      next(new AppError("Invalid token. Please log in again", 401));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      next(new AppError("User no longer exists", 401));
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    authLog.info("User authenticated", { userId: user.id });
    next();
  } catch (err) {
    next(err);
  }
};