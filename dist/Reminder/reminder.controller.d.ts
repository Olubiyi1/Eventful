import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
export declare const updateReminder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
