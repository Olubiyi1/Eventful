import prisma from "../config/prisma";
import Labels from "../utils/labels";
import AppError from "../errorHandlers/appError";
import { ReminderOffset } from "../../generated/prisma";

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

class EventService {
  static createEvent = async (
    creatorId: string,
    data: EventData
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
    data: Partial<EventData>
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
    creatorId: string
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

  static getAllEvents = async (): Promise<EventResponse[]> => {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });

    return events.map((event) => ({
      ...event,
      price: Number(event.price),
    }));
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
    creatorId: string
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