"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const serviceLog = labels_1.default.createLabel("SERVICE");
class TicketService {
}
_a = TicketService;
TicketService.getMyTickets = async (userId) => {
    const tickets = await prisma_1.default.ticket.findMany({
        where: { userId },
        include: {
            event: {
                select: {
                    title: true,
                    eventDate: true,
                    location: true,
                    price: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    serviceLog.info("User tickets fetched", { userId });
    return tickets.map((ticket) => ({
        ...ticket,
        event: {
            ...ticket.event,
            price: Number(ticket.event.price),
        },
    }));
};
TicketService.getSingleTicket = async (ticketId, userId) => {
    const ticket = await prisma_1.default.ticket.findUnique({
        where: { id: ticketId },
        include: {
            event: {
                select: {
                    title: true,
                    eventDate: true,
                    location: true,
                    price: true,
                },
            },
        },
    });
    if (!ticket) {
        throw new appError_1.default("Ticket not found", 404);
    }
    if (ticket.userId !== userId) {
        throw new appError_1.default("You are not authorized to view this ticket", 403);
    }
    serviceLog.info("Single ticket fetched", { ticketId, userId });
    return {
        ...ticket,
        event: {
            ...ticket.event,
            price: Number(ticket.event.price),
        },
    };
};
TicketService.scanTicket = async (qrUuid, creatorId) => {
    const ticket = await prisma_1.default.ticket.findUnique({
        where: { qrUuid },
        include: {
            event: true,
        },
    });
    if (!ticket) {
        throw new appError_1.default("Invalid QR code", 404);
    }
    if (ticket.event.creatorId !== creatorId) {
        throw new appError_1.default("You are not authorized to scan tickets for this event", 403);
    }
    if (ticket.scanned) {
        throw new appError_1.default(`Ticket already scanned at ${ticket.scannedAt?.toISOString()}`, 400);
    }
    await prisma_1.default.ticket.update({
        where: { qrUuid },
        data: {
            scanned: true,
            scannedAt: new Date(),
        },
    });
    serviceLog.info("Ticket scanned successfully", {
        qrUuid,
        creatorId,
        eventId: ticket.eventId,
        userId: ticket.userId,
    });
    return { message: "Ticket validated successfully. Entry granted." };
};
exports.default = TicketService;
//# sourceMappingURL=ticket.service.js.map