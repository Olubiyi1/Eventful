import Joi from "joi";

export const createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  eventDate: Joi.date().greater("now").required(),
  location: Joi.string().trim().min(3).max(200).required(),
  price: Joi.number().min(0).required(),
  capacity: Joi.number().integer().min(1).required(),
  defaultReminder: Joi.string()
    .valid(
      "ONE_HOUR_BEFORE",
      "THREE_HOURS_BEFORE",
      "ONE_DAY_BEFORE",
      "THREE_DAYS_BEFORE",
      "ONE_WEEK_BEFORE",
    )
    .optional(),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).optional(),
  description: Joi.string().trim().min(10).max(1000).optional(),
  eventDate: Joi.date().greater("now").optional(),
  location: Joi.string().trim().min(3).max(200).optional(),
  price: Joi.number().min(0).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  defaultReminder: Joi.string()
    .valid(
      "ONE_HOUR_BEFORE",
      "THREE_HOURS_BEFORE",
      "ONE_DAY_BEFORE",
      "THREE_DAYS_BEFORE",
      "ONE_WEEK_BEFORE",
    )
    .optional(),
});
