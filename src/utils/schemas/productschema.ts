import Joi from "joi";
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().max(500).required(),
  stock: Joi.number().min(0).required(),
  paperTextures: Joi.array().items(Joi.string()).min(1).required(),
  colours: Joi.array().items(Joi.string()).min(1).required(),
  material: Joi.array().items(Joi.string()).min(1).required(),
  print: Joi.array().items(Joi.string()).min(1).required(),
  installation: Joi.array().items(Joi.string()).min(1).required(),
  application: Joi.array().items(Joi.string()).min(1).required(),
});
export { productSchema };
