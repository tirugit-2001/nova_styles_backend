import mongoose from "mongoose";
import Product from "../../../models/product.schema";
/******** create product*******/
const create = async (data: any) => {
  return await Product.create(data);
};
/******** get all products*******/
const findAll = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const products = await Product.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Product.countDocuments();
  return { products, total };
};
/******** get product by id*******/
const findById = async (id: string, session?: mongoose.ClientSession) => {
  if (session) {
    return await Product.findById(id).session(session);
  }
  return await Product.findById(id);
};

/******** update product*******/
const update = async (id: string, data: any) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

/******** delete product*******/
const remove = async (id: string) => {
  return await Product.findByIdAndDelete(id);
};
/******** get trending products*******/
const findTrending = async () => {
  await Product.updateMany({ sold: { $exists: false } }, { $set: { sold: 0 } });
  return await Product.find().sort({ sold: -1 }).limit(4);
};

export default { create, findAll, findById, update, remove, findTrending };
