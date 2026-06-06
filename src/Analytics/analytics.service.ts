import prisma from "../config/prisma";
import Labels from "../utils/labels";
import AppError from "../errorHandlers/appError";
import { PaymentStatus } from "../../generated/prisma";

const analyticsLog = Labels.createLabel("ANALYTICS");

interface EventAnalytics {
  eventId: string;
  title: string;
  eventDate: Date;
  capacity: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendees: number;
  attendanceRate: string;
  remainingCapacity: number;
}

interface OverallAnalytics {
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendees: number;
  totalEvents: number;
  events: EventAnalytics[];
}

class AnalyticsService {
  static getEventAnalytics = async (
    eventId: string,
    creatorId: string
  ): Promise<EventAnalytics> => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.creatorId !== creatorId) {
      throw new AppError("You are not authorized to view this event's analytics", 403);
    }

    const [totalTicketsSold, totalAttendees, revenueData] = await Promise.all([
      prisma.ticket.count({ where: { eventId } }),
      prisma.ticket.count({ where: { eventId, scanned: true } }),
      prisma.payment.aggregate({
        where: { eventId, status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.amount ?? 0);
    const attendanceRate =
      totalTicketsSold > 0
        ? `${((totalAttendees / totalTicketsSold) * 100).toFixed(1)}%`
        : "0%";

    analyticsLog.info("Event analytics fetched", { eventId, creatorId });

    return {
      eventId: event.id,
      title: event.title,
      eventDate: event.eventDate,
      capacity: event.capacity,
      totalTicketsSold,
      totalRevenue,
      totalAttendees,
      attendanceRate,
      remainingCapacity: event.capacity - totalTicketsSold,
    };
  };

  static getOverallAnalytics = async (
    creatorId: string
  ): Promise<OverallAnalytics> => {
    const events = await prisma.event.findMany({
      where: { creatorId },
    });

    if (events.length === 0) {
      return {
        totalTicketsSold: 0,
        totalRevenue: 0,
        totalAttendees: 0,
        totalEvents: 0,
        events: [],
      };
    }

    const eventIds = events.map((event) => event.id);

    const [totalTicketsSold, totalAttendees, revenueData, eventAnalytics] =
      await Promise.all([
        prisma.ticket.count({ where: { eventId: { in: eventIds } } }),
        prisma.ticket.count({
          where: { eventId: { in: eventIds }, scanned: true },
        }),
        prisma.payment.aggregate({
          where: {
            eventId: { in: eventIds },
            status: PaymentStatus.SUCCESS,
          },
          _sum: { amount: true },
        }),
        Promise.all(
          events.map(async (event) => {
            const [sold, attended, revenue] = await Promise.all([
              prisma.ticket.count({ where: { eventId: event.id } }),
              prisma.ticket.count({
                where: { eventId: event.id, scanned: true },
              }),
              prisma.payment.aggregate({
                where: {
                  eventId: event.id,
                  status: PaymentStatus.SUCCESS,
                },
                _sum: { amount: true },
              }),
            ]);

            const attendanceRate =
              sold > 0
                ? `${((attended / sold) * 100).toFixed(1)}%`
                : "0%";

            return {
              eventId: event.id,
              title: event.title,
              eventDate: event.eventDate,
              capacity: event.capacity,
              totalTicketsSold: sold,
              totalRevenue: Number(revenue._sum.amount ?? 0),
              totalAttendees: attended,
              attendanceRate,
              remainingCapacity: event.capacity - sold,
            };
          })
        ),
      ]);

    analyticsLog.info("Overall analytics fetched", { creatorId });

    return {
      totalTicketsSold,
      totalRevenue: Number(revenueData._sum.amount ?? 0),
      totalAttendees,
      totalEvents: events.length,
      events: eventAnalytics,
    };
  };
}

export default AnalyticsService;