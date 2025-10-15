import { NextFunction, Request, Response } from "express";
import Product from "../../../models/product.schema";
import Cart from "../../../models/cart.schema";
import cartService from "../service/cart.service";
import Apperror from "../../../utils/apperror";

/***** add to cart *********/
const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Apperror("User not authenticated", 401);
    }
    const { productId, quantity } = req.body;
    const userId = req.user._id; // assuming authentication middleware

    const product = await cartService.addToCart(productId, quantity, userId);
    return res
      .status(201)
      .send({ message: "Product added to cart", product, success: true });
  } catch (err) {
    next(err);
  }
};

/***** get cart *********/
const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Apperror("User not authenticated", 401);
    }
    const userId = req.user._id;
    const cart = await cartService.getCart(userId);
    return res
      .status(200)
      .send({ cart, success: true, message: "Cart fetched successfully" });
  } catch (e) {
    next(e);
  }
};

/***** remove from cart *********/
const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Apperror("User not authenticated", 401);
    }
    const { productId } = req.params;
    const userId = req.user._id;
    const cart = await cartService.removeFromCart(productId, userId);
    return res
      .status(200)
      .send({ cart, success: true, message: "Item removed from cart" });
  } catch (e) {
    next(e);
  }
};
export default { addToCart, getCart, removeFromCart };
