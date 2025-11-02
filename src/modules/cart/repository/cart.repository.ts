import mongoose from "mongoose";
import Cart from "../../../models/cart.schema";
import { ICart, ICartInput } from "../../../types";
import Apperror from "../../../utils/apperror";

const findOne = async (userId: string, session?: mongoose.ClientSession) => {
  const query = Cart.findOne({ user: userId }).populate("items.product");
  if (session) {
    query.session(session);
  }
  return await query;
};

const createCart = async (data: any, session?: mongoose.ClientSession) => {
  if (session) {
    // Use session if provided
    return await Cart.create([data], { session }).then((res) => res[0]);
  }
  return await Cart.create(data);
};

const save = async (cart: any, session?: mongoose.ClientSession) => {
  let savedCart;

  if (session) {
    savedCart = await cart.save({ session });
  } else {
    savedCart = await cart.save();
  }

  // Populate after saving
  await savedCart.populate("items.product");

  return savedCart;
};

export default { findOne, createCart, save };
