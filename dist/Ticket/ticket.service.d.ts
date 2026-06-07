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
declare class TicketService {
    static getMyTickets: (userId: string) => Promise<TicketResponse[]>;
    static getSingleTicket: (ticketId: string, userId: string) => Promise<TicketResponse>;
    static scanTicket: (qrUuid: string, creatorId: string) => Promise<{
        message: string;
    }>;
}
export default TicketService;
