import { Request, Response, NextFunction } from "express";
import AppError from "../errorHandlers/appError";
import { ObjectSchema } from "joi";

const validate = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(", ");
    next(new AppError(errorMessages, 400));
    return;
  }

  req.body = value;
  next();
};

export default validate;