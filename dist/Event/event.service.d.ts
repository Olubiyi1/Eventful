import { ReminderOffset } from "../../generated/prisma";
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
declare class EventService {
    static createEvent: (creatorId: string, data: EventData) => Promise<EventResponse>;
    static updateEvent: (eventId: string, creatorId: string, data: Partial<EventData>) => Promise<EventResponse>;
    static deleteEvent: (eventId: string, creatorId: string) => Promise<void>;
    static getAllEvents: (filters?: EventFilters) => Promise<PaginatedEventResponse>;
    static getSingleEvent: (eventId: string) => Promise<EventResponse>;
    static getCreatorEvents: (creatorId: string) => Promise<EventResponse[]>;
}
export default EventService;
