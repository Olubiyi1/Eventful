import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import AnalyticsService from "./analytics.service";
import ResponseHandler from "../utils/ResponseHandler";
import AppError from "../errorHandlers/appError";
import Labels from "../utils/labels";

const analyticsControllerLogs = Labels.createLabel("CONTROLLER");

export const getEventAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const eventId = req.params.id as string;
    const result = await AnalyticsService.getEventAnalytics(eventId, req.user.id);

    analyticsControllerLogs.info("Event analytics fetched", {
      eventId,
      creatorId: req.user.id,
    });

    ResponseHandler.ok(res, "Analytics fetched successfully", { analytics: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      analyticsControllerLogs.warn("Failed to fetch event analytics", { reason: err.message });
      next(err);
      return;
    }
    analyticsControllerLogs.error("Unexpected error fetching event analytics", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const getOverallAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const result = await AnalyticsService.getOverallAnalytics(req.user.id);

    analyticsControllerLogs.info("Overall analytics fetched", { creatorId: req.user.id });

    ResponseHandler.ok(res, "Analytics fetched successfully", { analytics: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      analyticsControllerLogs.warn("Failed to fetch overall analytics", { reason: err.message });
      next(err);
      return;
    }
    analyticsControllerLogs.error("Unexpected error fetching overall analytics", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};