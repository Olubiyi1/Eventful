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
declare class AnalyticsService {
    static getEventAnalytics: (eventId: string, creatorId: string) => Promise<EventAnalytics>;
    static getOverallAnalytics: (creatorId: string) => Promise<OverallAnalytics>;
}
export default AnalyticsService;
