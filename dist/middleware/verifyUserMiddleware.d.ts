import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
export declare const verifyLoggedInUser: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const verifyUserByEmail: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
