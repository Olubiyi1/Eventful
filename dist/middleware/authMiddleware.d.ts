import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
