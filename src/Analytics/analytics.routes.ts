import { Router } from "express";
import { getEventAnalytics, getOverallAnalytics } from "./analytics.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLoggedInUser } from "../middleware/verifyUserMiddleware";
import { restrictTo } from "../middleware/restrictTo";
import RateLimiter from "../guards/rateLimiter";
import { Role } from "../../generated/prisma";

const analyticsRouter = Router();

analyticsRouter.get("/overall",RateLimiter.limiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.CREATOR]),getOverallAnalytics);

analyticsRouter.get("/event/:id",RateLimiter.limiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.CREATOR]),getEventAnalytics);

export default analyticsRouter;