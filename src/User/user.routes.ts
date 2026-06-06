import { Router } from "express";
import { registerUser, loginUser,getMyProfile,verifyEmail } from "./user.controller";
import RateLimiter from "../guards/rateLimiter";
import { verifyLoggedInUser } from "../middleware/verifyUserMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";
import { restrictTo } from "../middleware/restrictTo";
import validate from "../middleware/validationMiddleware";
import { Role } from "../../generated/prisma";
import { registerUserValidationSchema,loginValidationSchema } from "./user.validaton";
const userRouter = Router();

userRouter.post("/register",RateLimiter.registerLimiter,validate(registerUserValidationSchema), registerUser);
userRouter.post("/login", RateLimiter.loginLimiter,validate(loginValidationSchema),loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.get("/me",authMiddleware,verifyLoggedInUser,restrictTo([Role.CREATOR,Role.EVENTEE]),getMyProfile)
export default userRouter;


