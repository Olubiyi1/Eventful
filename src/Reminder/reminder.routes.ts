import { Router } from "express";
import { updateReminder } from "./reminder.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLoggedInUser } from "../middleware/verifyUserMiddleware";
import { restrictTo } from "../middleware/restrictTo";
import RateLimiter from "../guards/rateLimiter";
import { Role } from "../../generated/prisma";

const reminderRouter = Router();

reminderRouter.patch("/",RateLimiter.limiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.EVENTEE]),updateReminder);

export default reminderRouter;