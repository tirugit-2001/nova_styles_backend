import Joi from "joi";
import Apperror from "./apperror";

export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message).join(", ");
    throw new Apperror(messages, 400);
  }
  return value;
};
