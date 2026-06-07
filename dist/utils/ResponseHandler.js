"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseHandler {
    static ok(res, message = "Success", data = null) {
        return res.status(200).json({
            status: "success",
            message,
            data,
        });
    }
    static created(res, message = "Created successfully", data = null) {
        return res.status(201).json({
            status: "success",
            message,
            data,
        });
    }
    static badRequest(res, message = "Bad Request", errors = null) {
        return res.status(400).json({
            status: "fail",
            message,
            errors,
        });
    }
    static unauthorized(res, message = "Unauthorized") {
        return res.status(401).json({
            status: "fail",
            message,
        });
    }
    static forbidden(res, message = "Forbidden") {
        return res.status(403).json({
            status: "fail",
            message,
        });
    }
    static notFound(res, message = "Not Found") {
        return res.status(404).json({
            status: "fail",
            message,
        });
    }
    static conflict(res, message = "Conflict") {
        return res.status(409).json({
            status: "fail",
            message,
        });
    }
    static serverError(res, message = "Internal Server Error") {
        return res.status(500).json({
            status: "error",
            message,
        });
    }
}
exports.default = ResponseHandler;
//# sourceMappingURL=ResponseHandler.js.map