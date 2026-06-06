import UserService from "./user.service";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import ResponseHandler from "../utils/ResponseHandler";
import {
  registerUserValidationSchema,
  loginValidationSchema,
} from "./user.validaton";
import AppError from "../errorHandlers/appError";
import Labels from "../utils/labels";

const controllerLog = Labels.createLabel("CONTROLLER");

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = registerUserValidationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      controllerLog.warn("User registration validation failed", {
        email: req.body.email,
        errors: messages,
      });
      next(new AppError(messages.join(", "), 400));
      return;
    }

    const result = await UserService.register(value);

    controllerLog.info("User registration successful", {
      email: result.user.email,
      role: result.user.role,
    });

    ResponseHandler.created(res, result.message, { user: result.user });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
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
    next(new AppError("Something went wrong during registration", 500));
    return;
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      throw new AppError("Verification token is required", 400);
    }

    const result = await UserService.verifyEmail(token);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = loginValidationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      controllerLog.warn("User login validation failed", {
        email: req.body.email,
        errors: messages,
      });
      next(new AppError(messages.join(", "), 400));
      return;
    }

    const result = await UserService.login(value);

    controllerLog.info("User login successful", {
      email: result.user.email,
      role: result.user.role,
    });

    ResponseHandler.ok(res, "Login successful", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
      user: result.user,
    });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
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
    next(new AppError("Something went wrong during login", 500));
  }
};

export const getMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }
    const userId = req.user.id;

    const result = await UserService.profile(userId);

    controllerLog.info("Profile fetched", { userId });

    ResponseHandler.ok(res, "Profile fetched successfully", result);
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Profile fetch failed", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error fetching profile", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};
