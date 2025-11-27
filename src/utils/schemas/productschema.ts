import Joi from "joi";
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().max(500).required(),
  stock: Joi.number().min(0).required(),
  paperTextures: Joi.array().items(Joi.string()).min(1).required(),
  colours: Joi.array().items(Joi.string()).min(1).optional(),
  material: Joi.array().items(Joi.string()).min(1).optional(),
  print: Joi.array().items(Joi.string()).min(1).optional(),
  installation: Joi.array().items(Joi.string()).min(1).optional(),
  application: Joi.array().items(Joi.string()).min(1).required(),
  isTrending: Joi.boolean().optional().default(false),
  // imageUrl: Joi.string().required(),
});
export { productSchema };
