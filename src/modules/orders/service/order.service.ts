import orderRepository from "../repository/order.repository";
import mongoose from "mongoose";
import Apperror from "../../../utils/apperror";
import Product from "../../../models/product.schema";
import Address from "../../../models/address.schema";

const createOrder = async (
  userId: string,
  items: any[],
  addressOrId: any,
  paymentMethod: string,
  paymentId?: string,
  session?: mongoose.ClientSession
) => {
  if (!session)
    throw new Apperror("Session should not be provided externally", 500);

  let addressId: string;

  if (typeof addressOrId === "string") {
    // Existing address
    const existingAddress: any = await Address.findOne({
      _id: addressOrId,
      user: userId,
    }).session(session);
    if (!existingAddress) throw new Apperror("Address not found", 404);
    addressId = existingAddress._id.toString();
  } else {
    // New address
    const addr = addressOrId;
    if (
      !addr.firstName ||
      !addr.lastName ||
      !addr.phone ||
      !addr.street ||
      !addr.city ||
      !addr.state ||
      !addr.postalCode ||
      !addr.country
    ) {
      throw new Apperror("Incomplete address information", 400);
    }

    const newAddress: any = await Address.create([{ ...addr, user: userId }], {
      session,
    });
    addressId = newAddress[0]._id.toString();
  }

  const productDetails = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Apperror("Product not found", 404);
      if (product.stock < item.quantity)
        throw new Apperror(`Not enough stock for ${product.name}`, 400);

      product.stock -= item.quantity;
      await product.save({ session });

      return {
        productId: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity: item.quantity,
      };
    })
  );

  const totalAmount = productDetails.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const orderData = {
    userId,
    addressId,
    items: productDetails,
    totalAmount,
    paymentMethod,
    paymentId,
    status: "Processing",
  };

  return await orderRepository.create(orderData, session);
};

const getAllOrders = async () => orderRepository.findAll();
const getOrderById = async (id: string) => orderRepository.findById(id);
const getOrdersByUser = async (userId: string) =>
  orderRepository.findByUser(userId);
const updateOrderStatus = async (id: string, status: string) =>
  orderRepository.updateStatus(id, status);
const deleteOrder = async (id: string) => orderRepository.remove(id);

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
