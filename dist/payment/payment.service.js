"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../config/prisma"));
const labels_1 = __importDefault(require("../utils/labels"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const config_1 = __importDefault(require("../config/config"));
const prisma_2 = require("../../generated/prisma");
const qrQueue_1 = require("../queues/qrQueue");
const reminder_service_1 = __importDefault(require("../Reminder/reminder.service"));
const paymentServiceLogs = labels_1.default.createLabel("PAYMENT_SERVICE_LOGS");
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const paystackHeaders = {
    Authorization: `Bearer ${config_1.default.paystack_secret}`,
    "Content-Type": "application/json",
};
class PaymentService {
}
_a = PaymentService;
PaymentService.initializePayment = async (data) => {
    const { userId, eventId, email } = data;
    const event = await prisma_1.default.event.findUnique({ where: { id: eventId } });
    if (!event) {
        throw new appError_1.default("Event not found", 404);
    }
    const existingTicket = await prisma_1.default.ticket.findFirst({
        where: { userId, eventId },
    });
    if (existingTicket) {
        throw new appError_1.default("You have already purchased a ticket for this event", 409);
    }
    const soldTickets = await prisma_1.default.ticket.count({ where: { eventId } });
    if (soldTickets >= event.capacity) {
        throw new appError_1.default("This event is sold out", 400);
    }
    const existingPendingPayment = await prisma_1.default.payment.findFirst({
        where: { userId, eventId, status: prisma_2.PaymentStatus.PENDING },
    });
    if (existingPendingPayment) {
        throw new appError_1.default("You already have a pending payment for this event", 409);
    }
    const amount = Math.round(Number(event.price) * 100);
    console.log("Amount being sent to Paystack:", amount, typeof amount);
    const paystackResponse = await axios_1.default.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        email,
        amount,
        callback_url: `${config_1.default.app_url}/api/v1/payments/verify`,
        metadata: {
            userId,
            eventId,
        },
    }, { headers: paystackHeaders });
    const { authorization_url, reference } = paystackResponse.data.data;
    await prisma_1.default.payment.create({
        data: {
            userId,
            eventId,
            amount: event.price,
            reference,
            status: prisma_2.PaymentStatus.PENDING,
        },
    });
    paymentServiceLogs.info("Payment initialized", { userId, eventId, reference });
    return {
        authorizationUrl: authorization_url,
        reference,
    };
};
PaymentService.verifyPayment = async (reference) => {
    const paystackResponse = await axios_1.default.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, { headers: paystackHeaders });
    const { status, metadata } = paystackResponse.data.data;
    if (status !== "success") {
        throw new appError_1.default("Payment verification failed", 400);
    }
    const payment = await prisma_1.default.payment.findUnique({ where: { reference } });
    if (!payment) {
        throw new appError_1.default("Payment record not found", 404);
    }
    if (payment.status === prisma_2.PaymentStatus.SUCCESS) {
        paymentServiceLogs.warn("Payment already verified", { reference });
        return;
    }
    await prisma_1.default.payment.update({
        where: { reference },
        data: { status: prisma_2.PaymentStatus.SUCCESS, paidAt: new Date() },
    });
    const ticket = await prisma_1.default.ticket.create({
        data: {
            userId: metadata.userId,
            eventId: metadata.eventId,
            paymentId: payment.id,
            qrImageUrl: "",
        },
        include: {
            user: {
                select: {
                    email: true,
                    firstName: true,
                },
            },
        },
    });
    await reminder_service_1.default.createReminder(metadata.userId, metadata.eventId);
    await (0, qrQueue_1.addQrCodeJob)({
        ticketId: ticket.id,
        userId: metadata.userId,
        eventId: metadata.eventId,
        email: ticket.user.email,
        firstName: ticket.user.firstName,
        qrUuid: ticket.qrUuid,
    });
    paymentServiceLogs.info("Payment verified, ticket created, QR job queued", { reference });
};
PaymentService.handleWebhook = async (event, data) => {
    if (event === "charge.success") {
        const { reference } = data;
        await _a.verifyPayment(reference);
        paymentServiceLogs.info("Webhook processed", { reference });
    }
};
exports.default = PaymentService;
//# sourceMappingURL=payment.service.js.map