import { Router } from "express";
import { getMyTickets, getSingleTicket,scanTicket } from "./ticket.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyLoggedInUser } from "../middleware/verifyUserMiddleware";
import { restrictTo } from "../middleware/restrictTo";
import RateLimiter from "../guards/rateLimiter";
import { Role } from "../../generated/prisma";


const ticketRouter = Router();

ticketRouter.get("/my-tickets",RateLimiter.limiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.EVENTEE]),getMyTickets);

ticketRouter.get("/:id",RateLimiter.limiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.EVENTEE]),getSingleTicket);
ticketRouter.post("/scan",RateLimiter.limiter,authMiddleware,verifyLoggedInUser,restrictTo([Role.CREATOR]),scanTicket);

export default ticketRouter;