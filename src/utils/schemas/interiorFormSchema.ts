import Joi from "joi";

const interiorFormSchema = Joi.object({
  floorplan: Joi.string()
    .valid("1 BHK", "2 BHK", "3 BHK")
    .required()
    .messages({
      "any.only": "Floorplan must be one of: 1 BHK, 2 BHK, 3 BHK",
      "any.required": "Floorplan is required",
    }),
  purpose: Joi.string().optional().allow(""),
  selectedPackage: Joi.string().required().messages({
    "any.required": "Selected package is required",
  }),
  addons: Joi.array().items(Joi.string()).optional().default([]),
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian mobile number",
      "any.required": "Mobile number is required",
    }),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Pincode must be exactly 6 digits",
    }),
  whatsappUpdates: Joi.boolean().optional().default(false),
  packagePrice: Joi.number().min(0).optional(),
  addonsTotal: Joi.number().min(0).optional(),
  totalPrice: Joi.number().min(0).required().messages({
    "any.required": "Total price is required",
    "number.min": "Total price must be a positive number",
  }),
});

export { interiorFormSchema };

