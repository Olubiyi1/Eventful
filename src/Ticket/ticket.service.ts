import prisma from "../config/prisma";
import Labels from "../utils/labels";
import AppError from "../errorHandlers/appError";

const serviceLog = Labels.createLabel("SERVICE");

interface TicketResponse {
  id: string;
  eventId: string;
  userId: string;
  paymentId: string;
  qrUuid: string;
  qrImageUrl: string;
  scanned: boolean;
  scannedAt: Date | null;
  createdAt: Date;
  event: {
    title: string;
    eventDate: Date;
    location: string;
    price: number;
  };
}

class TicketService {
  static getMyTickets = async (userId: string): Promise<TicketResponse[]> => {
    const tickets = await prisma.ticket.findMany({
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

  static getSingleTicket = async (
    ticketId: string,
    userId: string
  ): Promise<TicketResponse> => {
    const ticket = await prisma.ticket.findUnique({
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
      throw new AppError("Ticket not found", 404);
    }

    if (ticket.userId !== userId) {
      throw new AppError("You are not authorized to view this ticket", 403);
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
  static scanTicket = async (
  qrUuid: string,
  creatorId: string
): Promise<{ message: string }> => {
  const ticket = await prisma.ticket.findUnique({
    where: { qrUuid },
    include: {
      event: true,
    },
  });

  if (!ticket) {
    throw new AppError("Invalid QR code", 404);
  }

  if (ticket.event.creatorId !== creatorId) {
    throw new AppError("You are not authorized to scan tickets for this event", 403);
  }

  if (ticket.scanned) {
    throw new AppError(
      `Ticket already scanned at ${ticket.scannedAt?.toISOString()}`,
      400
    );
  }

  await prisma.ticket.update({
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
}

export default TicketService;