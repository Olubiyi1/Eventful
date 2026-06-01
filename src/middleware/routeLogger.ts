import { Request, Response, NextFunction } from "express";
import Labels from "../utils/labels"

const routeLog = Labels.createLabel("ROUTE")

const routeLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Record when the request started
  const start = Date.now();

  // Log that request came in
  routeLog.info(`Incoming: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: ((req.headers["x-forwarded-for"] as string) || req.ip || "")
      .split(",")[0]
      .trim(),
  });

  // Set up a listener for when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;

    routeLog.info(`Completed: ${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: ((req.headers["x-forwarded-for"] as string) || req.ip || "")
        .split(",")[0]
        .trim(),
    });
  });

  next();
};

export default routeLogger;