import { Response } from "express";

class ResponseHandler {
  static ok(res: Response, message: string = "Success", data: unknown = null) {
    return res.status(200).json({
      status: "success",
      message,
      data,
    });
  }

  static created(res: Response, message: string = "Created successfully", data: unknown = null) {
    return res.status(201).json({
      status: "success",
      message,
      data,
    });
  }

  static badRequest(res: Response, message: string = "Bad Request", errors: unknown = null) {
    return res.status(400).json({
      status: "fail",
      message,
      errors,
    });
  }

  static unauthorized(res: Response, message: string = "Unauthorized") {
    return res.status(401).json({
      status: "fail",
      message,
    });
  }

  static forbidden(res: Response, message: string = "Forbidden") {
    return res.status(403).json({
      status: "fail",
      message,
    });
  }

  static notFound(res: Response, message: string = "Not Found") {
    return res.status(404).json({
      status: "fail",
      message,
    });
  }

  static conflict(res: Response, message: string = "Conflict") {
    return res.status(409).json({
      status: "fail",
      message,
    });
  }

  static serverError(res: Response, message: string = "Internal Server Error") {
    return res.status(500).json({
      status: "error",
      message,
    });
  }
}

export default ResponseHandler;