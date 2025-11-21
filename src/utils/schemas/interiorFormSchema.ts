import Joi from "joi";

const interiorTypeMap: Record<string, string> = {
  "modular interior": "modular interior",
  modular: "modular interior",
  "customized interior": "customized interior",
  customized: "customized interior",
  "customised interior": "customized interior",
  "customised-premium": "customised-premium",
  "customised premium": "customised-premium",
  "customized-premium": "customised-premium",
  premium: "customised-premium",
};

const interiorFormSchema = Joi.object({
  interiorType: Joi.string()
    .custom((value, helpers) => {
      if (!value) {
        return value;
      }

      const normalized = interiorTypeMap[value.trim().toLowerCase()];

      if (!normalized) {
        return helpers.error("any.only");
      }

      return normalized;
    })
    .required()
    .messages({
      "any.only": "Interior type must be 'modular interior', 'customized interior', or 'customised-premium'",
      "any.required": "Interior type is required",
    }),
  floorplan: Joi.string()
    .valid("1 BHK", "2 BHK", "3 BHK")
    .when("interiorType", {
      is: "modular interior",
      then: Joi.required().messages({
        "any.only": "Floorplan must be one of: 1 BHK, 2 BHK, 3 BHK",
        "any.required": "Floorplan is required for modular interior",
      }),
      otherwise: Joi.optional().allow("", null),
    }),
  purpose: Joi.string().optional().allow(""),
  selectedPackage: Joi.string()
    .when("interiorType", {
      is: "modular interior",
      then: Joi.required().messages({
        "any.required": "Selected package is required for modular interior",
      }),
      otherwise: Joi.optional().allow("", null),
    }),
  addons: Joi.array().items(Joi.string()).optional().default([]),
  message: Joi.string().max(1000).optional().allow("").messages({
    "string.max": "Message cannot exceed 1000 characters",
  }),
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
  totalPrice: Joi.number()
    .min(0)
    .when("interiorType", {
      is: "modular interior",
      then: Joi.required().messages({
        "any.required": "Total price is required for modular interior",
        "number.min": "Total price must be a positive number",
      }),
      otherwise: Joi.optional().default(0),
    }),
});

export { interiorFormSchema };

