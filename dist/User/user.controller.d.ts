import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
export declare const registerUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const loginUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
