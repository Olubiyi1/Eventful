import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
export declare const initializePayment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const handleWebhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
