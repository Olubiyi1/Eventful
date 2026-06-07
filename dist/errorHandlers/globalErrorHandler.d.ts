import { Request, Response, NextFunction } from "express";
import AppError from "./appError";
export declare const globalErrorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
