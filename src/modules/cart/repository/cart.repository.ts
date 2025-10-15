import Cart from "../../../models/cart.schema";
import { ICart, ICartInput } from "../../../types";

const findOne = async (userId: string) => {
  return await Cart.findOne({ user: userId }).populate("items.product");
};

const createCart = async (data: ICartInput) => {
  return await Cart.create(data);
};
export default { findOne, createCart };
