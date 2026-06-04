import axios from "axios";
import prisma from "../config/prisma";
import Labels from "../utils/labels";
import AppError from "../errorHandlers/appError";
import config from "../config/config";
import { PaymentStatus } from "../../generated/prisma";

const paymentServiceLogs = Labels.createLabel("PAYMENT_SERVICE_LOGS");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackHeaders = {
  Authorization: `Bearer ${config.paystack_secret}`,
  "Content-Type": "application/json",
};

interface InitializePaymentData {
  userId: string;
  eventId: string;
  email: string;
}

interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
}

class PaymentService {
  static initializePayment = async (
    data: InitializePaymentData,
  ): Promise<InitializePaymentResponse> => {
    const { userId, eventId, email } = data;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: { userId, eventId },
    });
    if (existingTicket) {
      throw new AppError(
        "You have already purchased a ticket for this event",
        409,
      );
    }

    const soldTickets = await prisma.ticket.count({ where: { eventId } });
    if (soldTickets >= event.capacity) {
      throw new AppError("This event is sold out", 400);
    }

    const existingPendingPayment = await prisma.payment.findFirst({
      where: { userId, eventId, status: PaymentStatus.PENDING },
    });
    if (existingPendingPayment) {
      throw new AppError(
        "You already have a pending payment for this event",
        409,
      );
    }

    const amount = Number(event.price) * 100;

    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount,
        callback_url: `${config.app_url}/api/v1/payments/verify`,
        metadata: {
          userId,
          eventId,
        },
      },
      { headers: paystackHeaders },
    );

    const { authorization_url, reference } = paystackResponse.data.data;

    await prisma.payment.create({
      data: {
        userId,
        eventId,
        amount: event.price,
        reference,
        status: PaymentStatus.PENDING,
      },
    });

    paymentServiceLogs.info("Payment initialized", { userId, eventId, reference });

    return {
      authorizationUrl: authorization_url,
      reference,
    };
  };

  static verifyPayment = async (reference: string): Promise<void> => {
    const paystackResponse = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: paystackHeaders },
    );

    const { status, metadata } = paystackResponse.data.data;

    if (status !== "success") {
      throw new AppError("Payment verification failed", 400);
    }

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) {
      throw new AppError("Payment record not found", 404);
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      paymentServiceLogs.warn("Payment already verified", { reference });
      return;
    }

    await prisma.payment.update({
      where: { reference },
      data: { status: PaymentStatus.SUCCESS, paidAt: new Date() },
    });

    await prisma.ticket.create({
      data: {
        userId: metadata.userId,
        eventId: metadata.eventId,
        paymentId: payment.id,
        qrImageUrl: "",
      },
    });

    paymentServiceLogs.info("Payment verified and ticket created", { reference });
  };

  static handleWebhook = async (event: string, data: any): Promise<void> => {
    if (event === "charge.success") {
      const { reference } = data;
      await PaymentService.verifyPayment(reference);
      paymentServiceLogs.info("Webhook processed", { reference });
    }
  };
}

export default PaymentService;
