import { Request, Response, NextFunction } from "express";
import AppError from "../errorHandlers/appError";
import { Role } from "../../generated/prisma";
import { AuthRequest } from "../types/express";

export const restrictTo = (allowedRoles:Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("You are not logged in", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      next(new AppError("You do not have permission to perform this action", 403));
      return;
    }

    next();
  };
};