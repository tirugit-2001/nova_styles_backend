import mongoose from "mongoose";
import Apperror from "../../../utils/apperror";
import { calculateCartTotal } from "../../../utils/helper";
import productRepository from "../../products/repository/product.repository";
import cartRepository from "../repository/cart.repository";

/****** Add to Cart ******/
const addToCart = async (
  productId: string,
  quantity: number,
  userId: string
) => {
  if (!productId || !quantity || quantity <= 0) {
    throw new Apperror("Invalid input", 400);
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const product = await productRepository.findById(productId);
    if (!product) throw new Apperror("Product not found", 404);
    if (product.stock < quantity)
      throw new Apperror(`Only ${product.stock} items left in stock`, 400);

    let cart = await cartRepository.findOne(userId, session);
    if (!cart) {
      cart = await cartRepository.createCart(
        {
          user: userId,
          items: [{ product: productId, quantity }],
        },
        session
      );
    } else {
      const existingItem = cart.items.find(
        (item) => item?.product?._id.toString() === productId
      );
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock)
          throw new Apperror(`Only ${product.stock} items left in stock`, 400);
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cartRepository.save(cart, session);
    await session.commitTransaction();
    session.endSession();
    await cart.populate("items.product");

    const totalPrice = calculateCartTotal(cart);
    return { ...cart.toObject(), totalPrice };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/****** Get Cart ******/

const getCart = async (userId: string) => {
  const cart = await cartRepository.findOne(userId);
  if (!cart) return { items: [], totalPrice: 0 };
  await cart.populate("items.product");
  const totalPrice = calculateCartTotal(cart);
  return { ...cart.toObject(), totalPrice };
};

/****** Remove from Cart ******/

const removeFromCart = async (productId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await cartRepository.findOne(userId, session);
    if (!cart) throw new Apperror("Cart not found", 404);

    cart.items = cart.items.filter(
      (i) => i.product._id.toString() !== productId
    );

    await cartRepository.save(cart, session);

    await session.commitTransaction();
    session.endSession();

    await cart.populate("items.product");
    const totalPrice = calculateCartTotal(cart);

    return { ...cart.toObject(), totalPrice };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/****** Update Quantity (+/-) ******/

const updateQuantity = async (
  productId: string,
  quantity: number,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await cartRepository.findOne(userId, session);
    if (!cart) throw new Apperror("Cart not found", 404);

    const item = cart.items.find(
      (i) => i.product._id?.toString() === productId
    );
    if (!item) throw new Apperror("Item not found in cart", 404);
    if (quantity < 1) throw new Apperror("Quantity must be at least 1", 400);

    const product = await productRepository.findById(productId);
    if (!product) throw new Apperror("Product not found", 404);
    if (product.stock < quantity)
      throw new Apperror(`Only ${product.stock} items left in stock`, 400);

    item.quantity = quantity;

    await cartRepository.save(cart, session); // save inside transaction
    await session.commitTransaction();
    session.endSession();

    await cart.populate("items.product");
    const totalPrice = calculateCartTotal(cart);

    return { ...cart.toObject(), totalPrice };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/****** Merge Guest Cart ******/

interface GuestCartItem {
  productId: string;
  quantity: number;
}

export const mergeCart = async (guestCart: GuestCartItem[], userId: string) => {
  if (!guestCart || guestCart.length === 0) return null;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let cart = await cartRepository.findOne(userId, session);
    if (!cart) {
      cart = await cartRepository.createCart(
        { user: userId, items: [] },
        session
      );
    }

    for (const guestItem of guestCart) {
      const product = await productRepository.findById(guestItem.productId);
      if (!product) continue;

      const existingItem = cart.items.find(
        (i) => i.product._id.toString() === guestItem.productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + guestItem.quantity;
        existingItem.quantity = Math.min(newQuantity, product.stock);
      } else {
        const quantityToAdd = Math.min(guestItem.quantity, product.stock);
        if (quantityToAdd > 0) {
          cart.items.push({
            product: guestItem.productId,
            quantity: quantityToAdd,
          });
        }
      }
    }

    // Save cart in transaction
    await cartRepository.save(cart, session);
    await session.commitTransaction();
    session.endSession();

    // Populate products and calculate totalPrice dynamically
    await cart.populate("items.product");
    const totalPrice = calculateCartTotal(cart);

    return { ...cart.toObject(), totalPrice };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export default {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  mergeCart,
};
