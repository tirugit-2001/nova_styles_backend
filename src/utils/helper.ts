// Helper to calculate total

import productRepository from "../modules/products/repository/product.repository";
import Apperror from "./apperror";

// export const calculateCartTotal = async (cart: any) => {
//   return cart.items.reduce(async (total: number, item: any) => {
//     const productPrice = await productRepository.findById(item.product);
//     if (!productPrice) {
//       throw new Apperror("product price not found", 404);
//     }
//     return total + productPrice.price * item.quantity * item.area;
//   }, 0);
// };
export const calculateCartTotal = async (cart: any) => {
  let total = 0;
  for (const item of cart.items) {
    const product = await productRepository.findById(item.product);
    if (!product) throw new Apperror("Product price not found", 404);
    total += product.price * item.quantity * (item.area || 1);
  }
  return total;
};
