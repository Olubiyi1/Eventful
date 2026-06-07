"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const prisma_2 = require("../../generated/prisma");
const analyticsLog = labels_1.default.createLabel("ANALYTICS");
class AnalyticsService {
}
_a = AnalyticsService;
AnalyticsService.getEventAnalytics = async (eventId, creatorId) => {
    const event = await prisma_1.default.event.findUnique({ where: { id: eventId } });
    if (!event) {
        throw new appError_1.default("Event not found", 404);
    }
    if (event.creatorId !== creatorId) {
        throw new appError_1.default("You are not authorized to view this event's analytics", 403);
    }
    const [totalTicketsSold, totalAttendees, revenueData] = await Promise.all([
        prisma_1.default.ticket.count({ where: { eventId } }),
        prisma_1.default.ticket.count({ where: { eventId, scanned: true } }),
        prisma_1.default.payment.aggregate({
            where: { eventId, status: prisma_2.PaymentStatus.SUCCESS },
            _sum: { amount: true },
        }),
    ]);
    const totalRevenue = Number(revenueData._sum.amount ?? 0);
    const attendanceRate = totalTicketsSold > 0
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
AnalyticsService.getOverallAnalytics = async (creatorId) => {
    const events = await prisma_1.default.event.findMany({
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
    const [totalTicketsSold, totalAttendees, revenueData, eventAnalytics] = await Promise.all([
        prisma_1.default.ticket.count({ where: { eventId: { in: eventIds } } }),
        prisma_1.default.ticket.count({
            where: { eventId: { in: eventIds }, scanned: true },
        }),
        prisma_1.default.payment.aggregate({
            where: {
                eventId: { in: eventIds },
                status: prisma_2.PaymentStatus.SUCCESS,
            },
            _sum: { amount: true },
        }),
        Promise.all(events.map(async (event) => {
            const [sold, attended, revenue] = await Promise.all([
                prisma_1.default.ticket.count({ where: { eventId: event.id } }),
                prisma_1.default.ticket.count({
                    where: { eventId: event.id, scanned: true },
                }),
                prisma_1.default.payment.aggregate({
                    where: {
                        eventId: event.id,
                        status: prisma_2.PaymentStatus.SUCCESS,
                    },
                    _sum: { amount: true },
                }),
            ]);
            const attendanceRate = sold > 0
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
        })),
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
exports.default = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map