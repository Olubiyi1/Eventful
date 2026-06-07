"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanTicket = exports.getSingleTicket = exports.getMyTickets = void 0;
const ticket_service_1 = __importDefault(require("./ticket.service"));
const ResponseHandler_1 = __importDefault(require("../utils/ResponseHandler"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const labels_1 = __importDefault(require("../utils/labels"));
const controllerLog = labels_1.default.createLabel("CONTROLLER");
const getMyTickets = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const result = await ticket_service_1.default.getMyTickets(req.user.id);
        controllerLog.info("User tickets fetched", { userId: req.user.id });
        ResponseHandler_1.default.ok(res, "Tickets fetched successfully", { tickets: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Failed to fetch tickets", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error fetching tickets", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getMyTickets = getMyTickets;
const getSingleTicket = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const ticketId = req.params.id;
        const result = await ticket_service_1.default.getSingleTicket(ticketId, req.user.id);
        controllerLog.info("Single ticket fetched", { ticketId, userId: req.user.id });
        ResponseHandler_1.default.ok(res, "Ticket fetched successfully", { ticket: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Failed to fetch ticket", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error fetching ticket", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getSingleTicket = getSingleTicket;
const scanTicket = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const { qrUuid } = req.body;
        if (!qrUuid) {
            next(new appError_1.default("QR code is required", 400));
            return;
        }
        const result = await ticket_service_1.default.scanTicket(qrUuid, req.user.id);
        controllerLog.info("Ticket scanned", {
            qrUuid,
            creatorId: req.user.id,
        });
        ResponseHandler_1.default.ok(res, result.message, {});
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Ticket scan failed", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error scanning ticket", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.scanTicket = scanTicket;
//# sourceMappingURL=ticket.controller.js.map