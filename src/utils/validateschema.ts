import Joi from "joi";
import Apperror from "./apperror";

export const validate = (schema: Joi.Schema, data: any) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false,
    convert: true,
  });
  if (error) {
    const messages = error.details.map((detail) => detail.message).join(", ");
    throw new Apperror(messages, 400);
  }
  return value;
};
