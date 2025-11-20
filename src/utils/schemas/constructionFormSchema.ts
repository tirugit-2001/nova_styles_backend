import Joi from "joi";

const contactFields = {
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
};

const legacyConstructionSchema = Joi.object({
  ...contactFields,
  projectType: Joi.string()
    .valid(
      "New Villa Construction",
      "Residential House",
      "Home Extension",
      "Complete Renovation"
    )
    .required()
    .messages({
      "any.only":
        "Project type must be one of: New Villa Construction, Residential House, Home Extension, Complete Renovation",
      "any.required": "Project type is required",
    }),
  plotSize: Joi.string()
    .valid("Up to 5 Cents", "5 - 10 Cents", "10-20 Cents", "20+ Cents")
    .required()
    .messages({
      "any.only":
        "Plot size must be one of: Up to 5 Cents, 5 - 10 Cents, 10-20 Cents, 20+ Cents",
      "any.required": "Plot size is required",
    }),
  builtUpArea: Joi.string()
    .valid("Up to 1000", "1000-1500", "1500-2500", "2500-4000", "4000+")
    .required()
    .messages({
      "any.only":
        "Built-up area must be one of: Up to 1000, 1000-1500, 1500-2500, 2500-4000, 4000+",
      "any.required": "Built-up area is required",
    }),
  requirements: Joi.object({
    "How many Floors": Joi.number().min(1).required(),
    Bedroom: Joi.number().min(1).required(),
    Bathrooms: Joi.number().min(1).required(),
    crockeryUnit: Joi.number().min(0).optional(),
    Kitchen: Joi.number().min(1).required(),
  }).required(),
  selectedPackage: Joi.string()
    .valid("Basic", "Standard", "Premium")
    .required()
    .messages({
      "any.only": "Selected package must be one of: Basic, Standard, Premium",
      "any.required": "Selected package is required",
    }),
  packagePrice: Joi.number().min(0).optional(),
  totalPrice: Joi.number().min(0).required().messages({
    "any.required": "Total price is required",
    "number.min": "Total price must be a positive number",
  }),
  message: Joi.string().max(2000).optional().allow(""),
});

const modernConstructionSchema = Joi.object({
  ...contactFields,
  buildingType: Joi.string().min(2).max(100).required(),
  sqft: Joi.number().min(1).required(),
  ratePerSqft: Joi.number().min(0).required(),
  estimatedPrice: Joi.number().min(0).required(),
  selectedPackage: Joi.string().min(2).max(100).required(),
  packagePrice: Joi.number().min(0).optional(),
  suggestions: Joi.string().max(2000).optional().allow(""),
  message: Joi.string().max(2000).optional().allow(""),
});

const constructionFormSchema = Joi.alternatives().try(
  legacyConstructionSchema,
  modernConstructionSchema
);

export { constructionFormSchema };

