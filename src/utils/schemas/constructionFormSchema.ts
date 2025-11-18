import Joi from "joi";

const constructionFormSchema = Joi.object({
  buildingType: Joi.string()
    .valid("Ground Floor", "Duplex Home", "G+2 or More Floors")
    .required()
    .messages({
      "any.only":
        "Building type must be one of: Ground Floor, Duplex Home, G+2 or More Floors",
      "any.required": "Building type is required",
    }),
  sqft: Joi.number().min(1).required().messages({
    "number.base": "Built-up area (sqft) must be a number",
    "number.min": "Built-up area must be greater than zero",
    "any.required": "Built-up area (sqft) is required",
  }),
  selectedPackage: Joi.string()
    .valid("Basic", "Standard", "Premium")
    .required()
    .messages({
      "any.only": "Selected package must be one of: Basic, Standard, Premium",
      "any.required": "Selected package is required",
    }),
  ratePerSqft: Joi.number().min(0).required().messages({
    "number.base": "Rate per sqft must be a number",
    "number.min": "Rate per sqft cannot be negative",
    "any.required": "Rate per sqft is required",
  }),
  estimatedPrice: Joi.number().min(0).required().messages({
    "number.base": "Estimated price must be a number",
    "number.min": "Estimated price cannot be negative",
    "any.required": "Estimated price is required",
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
  suggestions: Joi.string().max(1000).optional().allow(""),
});

export { constructionFormSchema };

