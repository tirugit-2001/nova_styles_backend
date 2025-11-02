import { NextFunction, Request, Response } from "express";
import cartService from "../service/cart.service";
import Apperror from "../../../utils/apperror";

/****** Add to Cart ******/
const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Apperror("User not authenticated", 401);

    const {
      productId,
      quantity,
      area,
      selectedColor,
      selectedTexture,
      name,
      image,
    } = req.body;
    const userId = req.user._id;
    const cart = await cartService.addToCart(
      productId,
      quantity,
      area,
      selectedColor,
      selectedTexture,
      name,
      image,
      userId
    );

    res.status(201).send({ success: true, message: "Item added", cart });
  } catch (e) {
    next(e);
  }
};

/****** Get Cart ******/
const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Apperror("User not authenticated", 401);

    const userId = req.user._id;
    const cart = await cartService.getCart(userId);
    console.log("car t card ");
    console.log(cart);
    res.status(200).send({ success: true, cart });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

/****** Remove Item ******/
const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new Apperror("User not authenticated", 401);

    const { productId } = req.params;
    const userId = req.user._id;
    const cart = await cartService.removeFromCart(productId, userId);

    res.status(200).send({ success: true, message: "Item removed", cart });
  } catch (e) {
    next(e);
  }
};

/****** Update Quantity (+ / −) ******/
const updateQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new Apperror("User not authenticated", 401);

    const { productId, quantity } = req.body;
    const userId = req.user._id;
    const cart = await cartService.updateQuantity(productId, quantity, userId);

    res.status(200).send({ success: true, message: "Quantity updated", cart });
  } catch (e) {
    next(e);
  }
};

/****** Merge Guest Cart ******/
const mergeCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Apperror("User not authenticated", 401);
    console.log("inside merge cart");
    console.log(req.user);
    const { guestCart } = req.body;
    console.log(guestCart);
    const userId = req.user._id;
    const cart = await cartService.mergeCart(guestCart, userId);
    console.log("cart");
    console.log(cart);
    res.status(200).send({ success: true, message: "Cart merged", cart });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export default {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  mergeCart,
};
