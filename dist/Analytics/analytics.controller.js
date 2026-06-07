"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverallAnalytics = exports.getEventAnalytics = void 0;
const analytics_service_1 = __importDefault(require("./analytics.service"));
const ResponseHandler_1 = __importDefault(require("../utils/ResponseHandler"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const labels_1 = __importDefault(require("../utils/labels"));
const analyticsControllerLogs = labels_1.default.createLabel("CONTROLLER");
const getEventAnalytics = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const eventId = req.params.id;
        const result = await analytics_service_1.default.getEventAnalytics(eventId, req.user.id);
        analyticsControllerLogs.info("Event analytics fetched", {
            eventId,
            creatorId: req.user.id,
        });
        ResponseHandler_1.default.ok(res, "Analytics fetched successfully", { analytics: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            analyticsControllerLogs.warn("Failed to fetch event analytics", { reason: err.message });
            next(err);
            return;
        }
        analyticsControllerLogs.error("Unexpected error fetching event analytics", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getEventAnalytics = getEventAnalytics;
const getOverallAnalytics = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const result = await analytics_service_1.default.getOverallAnalytics(req.user.id);
        analyticsControllerLogs.info("Overall analytics fetched", { creatorId: req.user.id });
        ResponseHandler_1.default.ok(res, "Analytics fetched successfully", { analytics: result });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            analyticsControllerLogs.warn("Failed to fetch overall analytics", { reason: err.message });
            next(err);
            return;
        }
        analyticsControllerLogs.error("Unexpected error fetching overall analytics", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.getOverallAnalytics = getOverallAnalytics;
//# sourceMappingURL=analytics.controller.js.map