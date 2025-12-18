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
  console.log(addressOrId);

  console.log("dohohohohoho");
  if (typeof addressOrId.addressId === "string") {
    if (!addressOrId.addressId) {
      throw new Apperror("address id not found ", 404);
    }
    const existingAddress: any = await Address.findOne({
      _id: addressOrId?.addressId,
      user: userId,
    }).session(session);
    if (!existingAddress) throw new Apperror("Address not found", 404);
    addressId = existingAddress._id.toString();
  } else {
    const addr = addressOrId;

    console.log(addr);
    console.log("dafafda");
    if (
      !addr.firstName ||
      !addr.lastName ||
      !addr.phone ||
      !addr.street ||
      !addr.city ||
      !addr.state ||
      !addr.postalCode ||
      !addr.country ||
      !addr.email
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
      const product = await Product.findById(item._id).session(session);
      if (!product) throw new Apperror("Product not found", 404);
      if (product.stock < item.quantity)
        throw new Apperror(`Not enough stock for ${product.name}`, 400);
      const texture: any = product.paperTextures.find((texture) => {
        return texture.name === item.selectedTexture;
      });
      if (!texture) {
        throw new Apperror(
          `Texture ${item.selectedTexture} not found for product ${product.name}`,
          400
        );
      }
      if (texture.rate !== item.price) {
        throw new Apperror(
          `Price mismatch for texture ${item.selectedTexture} of product ${product.name}`,
          400
        );
      }
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save({ session });

      return {
        productId: product._id,
        name: product.name,
        image: product.image,
        price: texture.rate,
        quantity: item.quantity,
        selectedTexture: item.selectedTexture,
        selectedColor: item.selectedColor,
        area: item.area,
        height: item.height,
        width: item.width,
      };
    })
  );

  const totalAmount = productDetails.reduce(
    (sum, i) => sum + i.price * i.quantity * (i.area <= 30 ? 30 : i.area),
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
    orderNumber: `NS-${Date.now()}`,
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
