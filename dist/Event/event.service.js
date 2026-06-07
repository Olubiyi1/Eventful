"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const redis_1 = __importDefault(require("../config/redis"));
const serviceLog = labels_1.default.createLabel("SERVICE");
class EventService {
}
_a = EventService;
EventService.createEvent = async (creatorId, data) => {
    const event = await prisma_1.default.event.create({
        data: {
            ...data,
            creatorId,
        },
    });
    serviceLog.info(`Event created: ${event.title}`, {
        creatorId,
        eventId: event.id,
    });
    return {
        ...event,
        price: Number(event.price),
    };
};
EventService.updateEvent = async (eventId, creatorId, data) => {
    const event = await prisma_1.default.event.findUnique({ where: { id: eventId } });
    if (!event) {
        throw new appError_1.default("Event not found", 404);
    }
    if (event.creatorId !== creatorId) {
        throw new appError_1.default("You are not authorized to update this event", 403);
    }
    const updatedEvent = await prisma_1.default.event.update({
        where: { id: eventId },
        data,
    });
    serviceLog.info(`Event updated: ${updatedEvent.title}`, {
        creatorId,
        eventId,
    });
    return {
        ...updatedEvent,
        price: Number(updatedEvent.price),
    };
};
EventService.deleteEvent = async (eventId, creatorId) => {
    const event = await prisma_1.default.event.findUnique({ where: { id: eventId } });
    if (!event) {
        throw new appError_1.default("Event not found", 404);
    }
    if (event.creatorId !== creatorId) {
        throw new appError_1.default("You are not authorized to delete this event", 403);
    }
    await prisma_1.default.event.delete({ where: { id: eventId } });
    serviceLog.info(`Event deleted: ${event.title}`, { creatorId, eventId });
};
EventService.getAllEvents = async (filters = {}) => {
    const { minPrice, maxPrice, startDate, endDate, location, search, page = 1, limit = 10, } = filters;
    // caching
    const cacheKey = `events:${JSON.stringify(filters)}`;
    const cached = await redis_1.default.get(cacheKey);
    if (cached) {
        serviceLog.info("Cache hit", { cacheKey });
        return JSON.parse(cached);
    }
    serviceLog.info("Cache miss", { cacheKey });
    // filtering
    const where = {};
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined)
            where.price.gte = minPrice.toString();
        if (maxPrice !== undefined)
            where.price.lte = maxPrice.toString();
    }
    if (startDate !== undefined || endDate !== undefined) {
        where.eventDate = {};
        if (startDate !== undefined)
            where.eventDate.gte = startDate;
        if (endDate !== undefined)
            where.eventDate.lte = endDate;
    }
    if (location) {
        where.location = { contains: location, mode: "insensitive" };
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
        prisma_1.default.event.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.default.event.count({ where }),
    ]);
    serviceLog.info("Events fetched", { filters, total });
    const result = {
        events: events.map((event) => ({
            ...event,
            price: Number(event.price),
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
    // save to cache with ttl
    await redis_1.default.setex(cacheKey, 300, JSON.stringify(result));
    return result;
};
EventService.getSingleEvent = async (eventId) => {
    const event = await prisma_1.default.event.findUnique({ where: { id: eventId } });
    if (!event) {
        throw new appError_1.default("Event not found", 404);
    }
    return {
        ...event,
        price: Number(event.price),
    };
};
EventService.getCreatorEvents = async (creatorId) => {
    const events = await prisma_1.default.event.findMany({
        where: { creatorId },
        orderBy: { createdAt: "desc" },
    });
    serviceLog.info(`Creator events fetched`, { creatorId });
    return events.map((event) => ({
        ...event,
        price: Number(event.price),
    }));
};
exports.default = EventService;
//# sourceMappingURL=event.service.js.map