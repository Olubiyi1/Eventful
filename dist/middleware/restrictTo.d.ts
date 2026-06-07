import { Response, NextFunction } from "express";
import { Role } from "../../generated/prisma";
import { AuthRequest } from "../types/express";
export declare const restrictTo: (allowedRoles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
