"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterEventSchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createEventSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(3).max(100).required(),
    description: joi_1.default.string().trim().min(10).max(1000).required(),
    eventDate: joi_1.default.date().greater("now").required(),
    location: joi_1.default.string().trim().min(3).max(200).required(),
    price: joi_1.default.number().min(0).required(),
    capacity: joi_1.default.number().integer().min(1).required(),
    defaultReminder: joi_1.default.string()
        .valid("ONE_HOUR_BEFORE", "THREE_HOURS_BEFORE", "ONE_DAY_BEFORE", "THREE_DAYS_BEFORE", "ONE_WEEK_BEFORE")
        .optional(),
});
exports.updateEventSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(3).max(100).optional(),
    description: joi_1.default.string().trim().min(10).max(1000).optional(),
    eventDate: joi_1.default.date().greater("now").optional(),
    location: joi_1.default.string().trim().min(3).max(200).optional(),
    price: joi_1.default.number().min(0).optional(),
    capacity: joi_1.default.number().integer().min(1).optional(),
    defaultReminder: joi_1.default.string()
        .valid("ONE_HOUR_BEFORE", "THREE_HOURS_BEFORE", "ONE_DAY_BEFORE", "THREE_DAYS_BEFORE", "ONE_WEEK_BEFORE")
        .optional(),
});
exports.filterEventSchema = joi_1.default.object({
    minPrice: joi_1.default.number().min(0).optional(),
    maxPrice: joi_1.default.number().min(0).optional(),
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
    location: joi_1.default.string().trim().optional(),
    search: joi_1.default.string().trim().optional(),
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
});
//# sourceMappingURL=event.validation.js.map