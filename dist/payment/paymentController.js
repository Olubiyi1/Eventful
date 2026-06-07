"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.verifyPayment = exports.initializePayment = void 0;
const payment_service_1 = __importDefault(require("./payment.service"));
const ResponseHandler_1 = __importDefault(require("../utils/ResponseHandler"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const labels_1 = __importDefault(require("../utils/labels"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config/config"));
const controllerLog = labels_1.default.createLabel("CONTROLLER");
const initializePayment = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new appError_1.default("Unauthorized", 401));
            return;
        }
        const { eventId } = req.body;
        if (!eventId) {
            next(new appError_1.default("Event ID is required", 400));
            return;
        }
        const result = await payment_service_1.default.initializePayment({
            userId: req.user.id,
            eventId,
            email: req.user.email,
        });
        controllerLog.info("Payment initialized", {
            userId: req.user.id,
            eventId,
        });
        ResponseHandler_1.default.ok(res, "Payment initialized", {
            authorizationUrl: result.authorizationUrl,
            reference: result.reference,
        });
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Payment initialization failed", {
                reason: err.message,
            });
            next(err);
            return;
        }
        console.log(err);
        controllerLog.error("Unexpected error initializing payment", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.initializePayment = initializePayment;
const verifyPayment = async (req, res, next) => {
    try {
        const { reference } = req.query;
        if (!reference) {
            next(new appError_1.default("Reference is required", 400));
            return;
        }
        await payment_service_1.default.verifyPayment(reference);
        controllerLog.info("Payment verified", { reference });
        ResponseHandler_1.default.ok(res, "Payment verified successfully", {});
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Payment verification failed", {
                reason: err.message,
            });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error verifying payment", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.verifyPayment = verifyPayment;
const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers["x-paystack-signature"];
        const hash = crypto_1.default
            .createHmac("sha512", config_1.default.paystack_secret)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== signature) {
            next(new appError_1.default("Invalid webhook signature", 401));
            return;
        }
        const { event, data } = req.body;
        await payment_service_1.default.handleWebhook(event, data);
        controllerLog.info("Webhook received and processed", { event });
        res.sendStatus(200);
    }
    catch (err) {
        if (err instanceof appError_1.default && err.isOperational) {
            controllerLog.warn("Webhook processing failed", { reason: err.message });
            next(err);
            return;
        }
        controllerLog.error("Unexpected error processing webhook", { error: err });
        next(new appError_1.default("Something went wrong", 500));
    }
};
exports.handleWebhook = handleWebhook;
//# sourceMappingURL=paymentController.js.map