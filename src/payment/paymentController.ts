import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import PaymentService from "./payment.service";
import ResponseHandler from "../utils/ResponseHandler";
import AppError from "../errorHandlers/appError";
import Labels from "../utils/labels";
import crypto from "crypto";
import config from "../config/config";

const controllerLog = Labels.createLabel("CONTROLLER");

export const initializePayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const { eventId } = req.body;

    if (!eventId) {
      next(new AppError("Event ID is required", 400));
      return;
    }

    const result = await PaymentService.initializePayment({
      userId: req.user.id,
      eventId,
      email: req.user.email,
    });

    controllerLog.info("Payment initialized", {
      userId: req.user.id,
      eventId,
    });

    ResponseHandler.ok(res, "Payment initialized", {
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    });
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Payment initialization failed", {
        reason: err.message,
      });
      next(err);
      return;
    }
    console.log(err)
    
    controllerLog.error("Unexpected error initializing payment", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reference } = req.query;

    if (!reference) {
      next(new AppError("Reference is required", 400));
      return;
    }

    await PaymentService.verifyPayment(reference as string);

    controllerLog.info("Payment verified", { reference });

    ResponseHandler.ok(res, "Payment verified successfully", {});
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Payment verification failed", {
        reason: err.message,
      });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error verifying payment", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;

    const hash = crypto
      .createHmac("sha512", config.paystack_secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      next(new AppError("Invalid webhook signature", 401));
      return;
    }

    const { event, data } = req.body;

    await PaymentService.handleWebhook(event, data);

    controllerLog.info("Webhook received and processed", { event });

    res.sendStatus(200);
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      controllerLog.warn("Webhook processing failed", { reason: err.message });
      next(err);
      return;
    }
    controllerLog.error("Unexpected error processing webhook", { error: err });
    next(new AppError("Something went wrong", 500));
  }
};