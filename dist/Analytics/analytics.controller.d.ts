import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
export declare const getEventAnalytics: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOverallAnalytics: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
