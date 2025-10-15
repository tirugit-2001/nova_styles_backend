import Product from "../../../models/product.schema";
const create = async (data: any) => {
  return await Product.create(data);
};

const findAll = async () => {
  return await Product.find();
};

const findById = async (id: string) => {
  return await Product.findById(id);
};

const update = async (id: string, data: any) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

const remove = async (id: string) => {
  return await Product.findByIdAndDelete(id);
};

export default { create, findAll, findById, update, remove };
