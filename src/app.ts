import express, { urlencoded,Request,Response,Application } from "express";
import routeLogger from "./middleware/routeLogger";
import helmet from "helmet";
// import cors from "cors"
import hpp from "hpp"
import { notFoundHandler } from "./errorHandlers/notFound";
import { globalErrorHandler } from "./errorHandlers/globalErrorHandler";
import userRouter from "./User/user.routes";
import RateLimiter from "./guards/rateLimiter";
import eventRouter from "./Event/event.route";
import paymentRouter from "./payment/payment.route";
import ticketRouter from "./Ticket/ticket.route";

const app: Application = express()
app.set("trust proxy",1)

// app.use(cors)

// securitymiddleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(urlencoded({ extended: true, limit: "10kb" }));
app.use(hpp());
// app.use(cookieParser())

// logging route
app.use(routeLogger)
app.use(RateLimiter.limiter)

// health check
app.get("/health",(req:Request,res:Response)=>{
    res.json({status:"alive"})
})

app.use("/api/v1/users",userRouter)
app.use("api/v1/events",eventRouter)
app.use("api/v1/payments",paymentRouter)
app.use("api/v1/tickets",ticketRouter)
app.get("/",(req,res)=>{
  res.json({message:"welcome here"})
})

app.use(notFoundHandler)
app.use(globalErrorHandler)

export default app;