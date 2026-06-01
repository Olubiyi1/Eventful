import { Request } from "express";
import { Role } from "../../generated/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    emailVerifiedAt?: Date;
  };
}