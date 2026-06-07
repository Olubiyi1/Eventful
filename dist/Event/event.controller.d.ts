import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import { Request } from "express";
export declare const createEvent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEvent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEvent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllEvents: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSingleEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCreatorEvents: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
