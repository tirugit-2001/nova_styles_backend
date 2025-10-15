// Helper to calculate total

import productRepository from "../modules/products/repository/product.repository";
import { ICartInput } from "../types";

const calculateCartTotal = async (cart: ICartInput) => {
  let total = 0;
  for (const item of cart.items) {
    const product = await productRepository.findById(item.product as string);
    if (product) total += product.price * item.quantity;
  }
  return total;
};

export { calculateCartTotal };
