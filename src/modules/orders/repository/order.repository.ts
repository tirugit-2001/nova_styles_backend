import Order from "../../../models/order.schema";
import mongoose from "mongoose";

const create = async (data: any, session?: mongoose.ClientSession) => {
  return session
    ? (await Order.create([data], { session }))[0]
    : await Order.create(data);
};

const findAll = async () => Order.find().populate("userId addressId paymentId");
const findById = async (id: string) =>
  Order.findById(id).populate("items.productId");
const findByUser = async (userId: string) => Order.find({ userId });
const updateStatus = async (id: string, status: string) =>
  Order.findByIdAndUpdate(id, { status }, { new: true });
const remove = async (id: string) => Order.findByIdAndDelete(id);

export default { create, findAll, findById, findByUser, updateStatus, remove };
