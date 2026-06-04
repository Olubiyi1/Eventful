import prisma from "../config/prisma";
import Labels from "../utils/labels";
import AppError from "../errorHandlers/appError";
import { ReminderOffset } from "../../generated/prisma";
import redisConnection from "../config/redis";

const serviceLog = Labels.createLabel("SERVICE");

interface EventData {
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  price: number;
  capacity: number;
  defaultReminder?: ReminderOffset;
}

interface EventResponse {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  price: number;
  capacity: number;
  defaultReminder: ReminderOffset;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventFilters {
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedEventResponse {
  events: EventResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class EventService {
  static createEvent = async (
    creatorId: string,
    data: EventData,
  ): Promise<EventResponse> => {
    const event = await prisma.event.create({
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

  static updateEvent = async (
    eventId: string,
    creatorId: string,
    data: Partial<EventData>,
  ): Promise<EventResponse> => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.creatorId !== creatorId) {
      throw new AppError("You are not authorized to update this event", 403);
    }

    const updatedEvent = await prisma.event.update({
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

  static deleteEvent = async (
    eventId: string,
    creatorId: string,
  ): Promise<void> => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.creatorId !== creatorId) {
      throw new AppError("You are not authorized to delete this event", 403);
    }

    await prisma.event.delete({ where: { id: eventId } });

    serviceLog.info(`Event deleted: ${event.title}`, { creatorId, eventId });
  };

  static getAllEvents = async (
    filters: EventFilters = {},
  ): Promise<PaginatedEventResponse> => {
    const {
      minPrice,
      maxPrice,
      startDate,
      endDate,
      location,
      search,
      page = 1,
      limit = 10,
    } = filters;

    // caching
    const cacheKey = `events:${JSON.stringify(filters)}`;

    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      serviceLog.info("Cache hit", { cacheKey });
      return JSON.parse(cached);
    }

    serviceLog.info("Cache miss", { cacheKey });

    // filtering
    const where: any = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice.toString();
      if (maxPrice !== undefined) where.price.lte = maxPrice.toString();
    }

    if (startDate !== undefined || endDate !== undefined) {
      where.eventDate = {};
      if (startDate !== undefined) where.eventDate.gte = startDate;
      if (endDate !== undefined) where.eventDate.lte = endDate;
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
      prisma.event.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
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
    await redisConnection.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  };

  static getSingleEvent = async (eventId: string): Promise<EventResponse> => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    return {
      ...event,
      price: Number(event.price),
    };
  };

  static getCreatorEvents = async (
    creatorId: string,
  ): Promise<EventResponse[]> => {
    const events = await prisma.event.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
    });

    serviceLog.info(`Creator events fetched`, { creatorId });

    return events.map((event) => ({
      ...event,
      price: Number(event.price),
    }));
  };
}

export default EventService;
