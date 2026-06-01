import { Router } from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getSingleEvent,
  getCreatorEvents,
} from "./event.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLoggedInUser } from "../middleware/verifyUserMiddleware";
import { restrictTo } from "../middleware/restrictTo";
import RateLimiter from "../guards/rateLimiter";
import { Role } from "../../generated/prisma";

const eventRouter = Router();

// public routes
// public routes
eventRouter.get("/", RateLimiter.limiter, getAllEvents);
eventRouter.get("/my-events", authMiddleware, verifyLoggedInUser, restrictTo([Role.CREATOR]), getCreatorEvents); // ← before /:id
eventRouter.get("/:id", RateLimiter.limiter, getSingleEvent);

// protected routes — CREATOR only
eventRouter.post("/",RateLimiter.createEventLimiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.CREATOR]),createEvent);
eventRouter.patch("/:id",RateLimiter.updateEventLimiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.CREATOR]),updateEvent);
eventRouter.delete("/:id",RateLimiter.deleteEventLimiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.CREATOR]),deleteEvent);

export default eventRouter;