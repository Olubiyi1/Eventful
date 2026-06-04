import { Router } from "express";
import { initializePayment,verifyPayment,handleWebhook } from "./paymentController";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLoggedInUser } from "../middleware/verifyUserMiddleware";
import { restrictTo } from "../middleware/restrictTo";
import RateLimiter from "../guards/rateLimiter";
import { Role } from "../../generated/prisma";
import express from "express";

const paymentRouter = Router();

// webhook must use raw body — must be before express.json()
paymentRouter.post("/webhook",express.raw({ type: "application/json" }),handleWebhook,);

// initialize payment — authenticated eventees only
paymentRouter.post("/initialize",RateLimiter.limiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.EVENTEE]),initializePayment,);

// verify payment — called by Paystack redirect
paymentRouter.get("/verify", verifyPayment);

export default paymentRouter;
