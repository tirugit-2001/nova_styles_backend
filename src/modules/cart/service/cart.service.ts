import Apperror from "../../../utils/apperror";
import { calculateCartTotal } from "../../../utils/helper";
import productRepository from "../../products/repository/product.repository";
import cartRepository from "../repository/cart.repository";

/****** add to cart ******/
const addToCart = async (
  productId: string,
  quantity: number,
  userId: string
) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Apperror("Product not found", 404);
  if (product.stock < quantity) {
    throw new Apperror(`Only ${product.stock} items left in stock`, 400);
  }
  let cart = await cartRepository.findOne(userId);
  if (!cart) {
    cart = await cartRepository.createCart({
      user: userId,
      items: [{ product: productId, quantity }],
      totalPrice: product.price * quantity,
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new Apperror(`Only ${product.stock} items left in stock`, 400);
      }
      existingItem.quantity = newQuantity;
    } else {
      if (quantity > product.stock) {
        throw new Apperror(`Only ${product.stock} items left in stock`, 400);
      }
      cart.items.push({ product: productId, quantity });
    }
    cart.totalPrice = await calculateCartTotal(cart);
    return await cart.save();
  }
};

/****** get cart ******/
const getCart = async (userId: string) => {
  return await cartRepository.findOne(userId);
};

/****** remove from cart ******/
const removeFromCart = async (productId: string, userId: string) => {
  const cart = await cartRepository.findOne(userId);
  if (!cart) throw new Apperror("Cart not found", 404);
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );
  cart.totalPrice = await calculateCartTotal(cart);
  await cart.save();
  return cart;
};
export default { addToCart, getCart, removeFromCart };
