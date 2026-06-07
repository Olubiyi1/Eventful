"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorEvents = exports.getSingleEvent = exports.getAllEvents = exports.deleteEvent = exports.updateEvent = exports.createEvent = void 0;
const event_service_1 = __importDefault(require("./event.service"));
const ResponseHandler_1 = __importDefault(require("../utils/ResponseHandler"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const labels_1 = __importDefault(require("../utils/labels"));
const event_validation_1 = require("./event.validation");
const controllerLog = labels_1.default.createLabel("CONTROLLER");
const createEvent = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const { error, value } = event_validation_1.createEventSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const messages = error.details.map((detail) => detail.message);
            controllerLog.warn("Event creation validation failed", {
                creatorId: req.user.id,
                errors: messages,
            });
            next(new appError_1.default(messages.join(", "), 400));
            return;
        }
        const result = await event_service_1.default.createEvent(req.user.id, value);
        controllerLog.info("Event created successfully", {
            creatorId: req.user.id,
            eventId: result.id,
        });
        ResponseHandler_1.default.created(res, "Event created successfully", { event: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Event creation failed", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error creating event", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const { error, value } = event_validation_1.updateEventSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const messages = error.details.map((detail) => detail.message);
            controllerLog.warn("Event update validation failed", {
                creatorId: req.user.id,
                errors: messages,
            });
            next(new appError_1.default(messages.join(", "), 400));
            return;
        }
        const result = await event_service_1.default.updateEvent(eventId, req.user.id, value);
        controllerLog.info("Event updated successfully", {
            creatorId: req.user.id,
            eventId: req.params.id,
        });
        ResponseHandler_1.default.ok(res, "Event updated successfully", { event: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Event update failed", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error updating event", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        await event_service_1.default.deleteEvent(eventId, req.user.id);
        controllerLog.info("Event deleted successfully", {
            creatorId: req.user.id,
            eventId: req.params.id,
        });
        ResponseHandler_1.default.ok(res, "Event deleted successfully", {});
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Event deletion failed", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error deleting event", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.deleteEvent = deleteEvent;
const getAllEvents = async (req, res, next) => {
    try {
        const { minPrice, maxPrice, startDate, endDate, location, search, page, limit } = req.query;
        const { error, value } = event_validation_1.filterEventSchema.validate({
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            location: location,
            search: search,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        }, { abortEarly: false, stripUnknown: true });
        if (error) {
            const messages = error.details.map((detail) => detail.message);
            next(new appError_1.default(messages.join(", "), 400));
            return;
        }
        const result = await event_service_1.default.getAllEvents(value);
        controllerLog.info("All events fetched", { filters: value });
        ResponseHandler_1.default.ok(res, "Events fetched successfully", result);
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Failed to fetch events", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error fetching events", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getAllEvents = getAllEvents;
const getSingleEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const result = await event_service_1.default.getSingleEvent(eventId);
        controllerLog.info("Event fetched", { eventId: req.params.id });
        ResponseHandler_1.default.ok(res, "Event fetched successfully", { event: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Failed to fetch event", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error fetching event", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getSingleEvent = getSingleEvent;
const getCreatorEvents = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const result = await event_service_1.default.getCreatorEvents(req.user.id);
        controllerLog.info("Creator events fetched", { creatorId: req.user.id });
        ResponseHandler_1.default.ok(res, "Events fetched successfully", { events: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Failed to fetch creator events", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error fetching creator events", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getCreatorEvents = getCreatorEvents;
//# sourceMappingURL=event.controller.js.map