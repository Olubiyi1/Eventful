import { Request, Response, NextFunction } from "express";
declare const routeLogger: (req: Request, res: Response, next: NextFunction) => void;
export default routeLogger;
