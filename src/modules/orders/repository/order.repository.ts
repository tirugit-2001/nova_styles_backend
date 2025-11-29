import Order from "../../../models/order.schema";
import mongoose from "mongoose";

const create = async (data: any, session?: mongoose.ClientSession) => {
  if (session) {
    const order = new Order(data);
    await order.save({ session });
    return order;
  }

  const order = new Order(data);
  await order.save();
  return order;
};
const findAll = async () => Order.find().populate("userId addressId paymentId");
const findById = async (id: string) =>
  Order.findById(id).populate("items.productId");
const findByPaymentId = async (paymentId: string) =>
  Order.findOne({ paymentId });
const findByUser = async (userId: string) => Order.find({ userId });
const updateStatus = async (id: string, status: string) =>
  Order.findByIdAndUpdate(id, { status }, { new: true });
const remove = async (id: string) => Order.findByIdAndDelete(id);

export default {
  create,
  findAll,
  findById,
  findByUser,
  updateStatus,
  remove,
  findByPaymentId,
};
