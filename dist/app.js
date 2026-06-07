"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const routeLogger_1 = __importDefault(require("./middleware/routeLogger"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const hpp_1 = __importDefault(require("hpp"));
const notFound_1 = require("./errorHandlers/notFound");
const globalErrorHandler_1 = require("./errorHandlers/globalErrorHandler");
const user_routes_1 = __importDefault(require("./User/user.routes"));
const rateLimiter_1 = __importDefault(require("./guards/rateLimiter"));
const event_route_1 = __importDefault(require("./Event/event.route"));
const payment_route_1 = __importDefault(require("./payment/payment.route"));
const ticket_route_1 = __importDefault(require("./Ticket/ticket.route"));
const reminder_routes_1 = __importDefault(require("./Reminder/reminder.routes"));
const analytics_routes_1 = __importDefault(require("./Analytics/analytics.routes"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
// Allow all origins
// app.use(cors)
// securitymiddleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, express_1.urlencoded)({ extended: true, limit: "10kb" }));
app.use((0, hpp_1.default)());
// app.use(cookieParser())
// logging route
app.use(routeLogger_1.default);
app.use(rateLimiter_1.default.limiter);
// health check
app.get("/health", (req, res) => {
    res.json({ status: "alive" });
});
// routes
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/events", event_route_1.default);
app.use("/api/v1/payments", payment_route_1.default);
app.use("/api/v1/tickets", ticket_route_1.default);
app.use("/api/v1/reminders", reminder_routes_1.default);
app.use("/api/v1/analytics", analytics_routes_1.default);
app.get("/", (req, res) => {
    res.json({ message: "welcome here" });
});
app.use(notFound_1.notFoundHandler);
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map