import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
export declare const getMyTickets: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSingleTicket: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const scanTicket: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
