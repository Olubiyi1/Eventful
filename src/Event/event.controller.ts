import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import { Request } from "express";
import EventService from "./event.service";
import ResponseHandler from "../utils/ResponseHandler";
import AppError from "../errorHandlers/appError";
import Labels from "../utils/labels";
import { createEventSchema, updateEventSchema,filterEventSchema } from "./event.validation";

const controllerLog = Labels.createLabel("CONTROLLER");


export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const { error, value } = createEventSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      controllerLog.warn("Event creation validation failed", {
        creatorId: req.user.id,
        errors: messages,
      });
      next(new AppError(messages.join(", "), 400));
      return;
    }

    const result = await EventService.createEvent(req.user.id, value);

    controllerLog.info("Event created successfully", {
      creatorId: req.user.id,
      eventId: result.id,
    });

    ResponseHandler.created(res, "Event created successfully", { event: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Event creation failed", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error creating event", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const { error, value } = updateEventSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      controllerLog.warn("Event update validation failed", {
        creatorId: req.user.id,
        errors: messages,
      });
      next(new AppError(messages.join(", "), 400));
      return;
    }

    const result = await EventService.updateEvent(
      eventId,
      req.user.id,
      value
    );

    controllerLog.info("Event updated successfully", {
      creatorId: req.user.id,
      eventId: req.params.id,
    });

    ResponseHandler.ok(res, "Event updated successfully", { event: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Event update failed", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error updating event", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    await EventService.deleteEvent(eventId, req.user.id);

    controllerLog.info("Event deleted successfully", {
      creatorId: req.user.id,
      eventId: req.params.id,
    });

    ResponseHandler.ok(res, "Event deleted successfully", {});
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Event deletion failed", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error deleting event", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { minPrice, maxPrice, startDate, endDate, location, search, page, limit } = req.query;

    const { error, value } = filterEventSchema.validate(
      {
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        location: location as string | undefined,
        search: search as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      next(new AppError(messages.join(", "), 400));
      return;
    }

    const result = await EventService.getAllEvents(value);

    controllerLog.info("All events fetched", { filters: value });

    ResponseHandler.ok(res, "Events fetched successfully", result);
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Failed to fetch events", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error fetching events", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const getSingleEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string
    const result = await EventService.getSingleEvent(eventId);

    controllerLog.info("Event fetched", { eventId: req.params.id });

    ResponseHandler.ok(res, "Event fetched successfully", { event: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Failed to fetch event", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error fetching event", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const getCreatorEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const result = await EventService.getCreatorEvents(req.user.id);

    controllerLog.info("Creator events fetched", { creatorId: req.user.id });

    ResponseHandler.ok(res, "Events fetched successfully", { events: result });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Failed to fetch creator events", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error fetching creator events", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};