import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import TicketService from "./ticket.service";
import ResponseHandler from "../utils/ResponseHandler";
import AppError from "../errorHandlers/appError";
import Labels from "../utils/labels";

const controllerLog = Labels.createLabel("CONTROLLER");

export const getMyTickets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const result = await TicketService.getMyTickets(req.user.id);

    controllerLog.info("User tickets fetched", { userId: req.user.id });

    ResponseHandler.ok(res, "Tickets fetched successfully", { tickets: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Failed to fetch tickets", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error fetching tickets", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const getSingleTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const ticketId = req.params.id as string;
    const result = await TicketService.getSingleTicket(ticketId, req.user.id);

    controllerLog.info("Single ticket fetched", { ticketId, userId: req.user.id });

    ResponseHandler.ok(res, "Ticket fetched successfully", { ticket: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Failed to fetch ticket", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error fetching ticket", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const scanTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const { qrUuid } = req.body;

    if (!qrUuid) {
      next(new AppError("QR code is required", 400));
      return;
    }

    const result = await TicketService.scanTicket(qrUuid, req.user.id);

    controllerLog.info("Ticket scanned", {
      qrUuid,
      creatorId: req.user.id,
    });

    ResponseHandler.ok(res, result.message, {});
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Ticket scan failed", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error scanning ticket", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};
