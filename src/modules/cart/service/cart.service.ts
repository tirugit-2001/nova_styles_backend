import mongoose from "mongoose";
import Apperror from "../../../utils/apperror";
import { calculateCartTotal } from "../../../utils/helper";
import productRepository from "../../products/repository/product.repository";
import cartRepository from "../repository/cart.repository";
import Product from "../../../models/product.schema";
import { height } from "pdfkit/js/page";

/****** Add to Cart ******/
const addToCart = async (
  productId: string,
  quantity: number,
  area: number,
  selectedColor: string,
  selectedTexture: string,
  name: string,
  image: string,
  userId: string,
  height: number,
  width: number
) => {
  if (
    !height ||
    !width ||
    !productId ||
    !quantity ||
    quantity <= 0 ||
    area == undefined ||
    !selectedColor ||
    !selectedTexture ||
    !name
  ) {
    throw new Apperror("Invalid input", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const product = await productRepository.findById(productId);
    if (!product) throw new Apperror("Product not found", 404);
    if (product.stock < quantity)
      throw new Apperror(`Only ${product.stock} items left in stock`, 400);
    const textureName = product.paperTextures.find(
      (tex: any) => tex.name === selectedTexture
    );
    if (!textureName)
      throw new Apperror(
        "Selected texture not available for this product",
        400
      );
    let cart = await cartRepository.findOne(userId, session);

    if (!cart) {
      cart = await cartRepository.createCart(
        {
          user: userId,
          items: [
            {
              product: productId,
              quantity,
              area,
              selectedColor,
              selectedTexture,
              name,
              height,
              width,
              image,
            },
          ],
        },
        session
      );
    } else {
      const getProductId = (p: any) =>
        p._id ? p._id.toString() : p.toString();
      const existingItem = cart.items.find(
        (item) => getProductId(item.product) === productId
      );
      if (existingItem) {
        cart.items = cart.items.filter(
          (item) => getProductId(item.product) !== productId
        );
        if (quantity > product.stock)
          throw new Apperror(`Only ${product.stock} items left in stock`, 400);
      }
      cart.items.push({
        product: productId,
        quantity,
        area,
        selectedColor,
        selectedTexture,
        name,
        image,
        height,
        width,
      });
    }

    await cartRepository.save(cart, session);
    const totalPrice = await calculateCartTotal(cart);
    const cartItemsIds = cart.items.map((item) => item.product._id.toString());
    const products = await Product.find({ _id: { $in: cartItemsIds } });
    const productMap = new Map<string, any>();
    products.forEach((p) => {
      productMap.set(p._id.toString(), p);
    });

    // Transform cart items into frontend-ready format
    const formattedItems = cart.items.map((item) => {
      const productData = productMap.get(item.product._id.toString());
      const texture = productData.paperTextures?.find(
        (tex: any) => tex.name === item.selectedTexture
      );
      if (!texture) throw new Apperror("Selected texture not found", 404);
      if (!productData) throw new Error("Product not found");
      return {
        productId: item.product._id.toString(),
        quantity: item.quantity,
        product: {
          _id: productData._id.toString(),
          name: productData.name,
          image: productData.image,
          price: texture.rate,
          area: item.area,
          selectedColor: item.selectedColor,
          selectedTexture: item.selectedTexture,
          quantity: item.quantity,
          height: item.height,
          width: item.width,
        },
      };
    });
    await session.commitTransaction();
    session.endSession();
    return { items: formattedItems, totalPrice };
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/****** Get Cart ******/
const getCart = async (userId: string) => {
  const cart = await cartRepository.findOne(userId);
  if (!cart) return { items: [], totalPrice: 0 };
  const cartItemsIds = cart.items.map((item: any) => {
    return item.product._id.toString();
  });
  const products = await Product.find({ _id: { $in: cartItemsIds } });
  console.log("products");
  console.log(products);
  const productMap = new Map<string, any>();
  products.forEach((p) => productMap.set(p._id.toString(), p));
  const formattedItems = cart.items.map((item) => {
    const productData = productMap.get(item.product._id.toString());
    if (!productData) throw new Apperror("Product not found", 404);

    const texture = productData.paperTextures?.find(
      (tex: any) => tex.name === item.selectedTexture
    );
    if (!texture) throw new Apperror("Selected texture not found", 404);
    return {
      productId: item.product._id.toString(),
      quantity: item.quantity,
      isAvailable: productData.stock > 0,
      product: {
        _id: productData._id.toString(),
        name: productData.name,
        image: productData.image,
        price: texture.rate,
        area: item.area,
        selectedColor: item.selectedColor,
        selectedTexture: item.selectedTexture,
        quantity: item.quantity,
        height: item.height,
        width: item.width,
      },
    };
  });
  const totalPrice = formattedItems.reduce((sum, i) => {
    if (!i.isAvailable) return sum;
    return sum + (i.product?.price || 0) * i.quantity * (i.product?.area || 1);
  }, 0);
  return { items: formattedItems, totalPrice };
};

/****** Remove from Cart ******/
const removeFromCart = async (productId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await cartRepository.findOne(userId, session);
    console.log(productId);
    console.log("cart before deleting");
    console.log(JSON.stringify(cart, null, 2));
    if (!cart) throw new Apperror("Cart not found", 404);
    const getProductId = (p: any) => (p._id ? p._id.toString() : p.toString());
    cart.items = cart.items.filter(
      (i) => getProductId(i.product) !== productId
    );
    const savedCart = await cartRepository.save(cart, session);
    console.log("saved Cart");
    console.log(savedCart);
    const cartItemsIds = cart.items.map((item) => item.product._id.toString());
    const products = await Product.find({ _id: { $in: cartItemsIds } });
    const productMap = new Map<string, any>();
    products.forEach((p) => {
      productMap.set(p._id.toString(), p);
    });
    const formattedItems = cart.items.map((item) => {
      const productData = productMap.get(item.product._id.toString());
      if (!productData) throw new Error("Product not found");
      const texture = productData.paperTextures?.find(
        (tex: any) => tex.name === item.selectedTexture
      );
      if (!texture) throw new Apperror("Selected texture not found", 404);
      return {
        productId: item.product._id.toString(),
        quantity: item.quantity,
        product: {
          _id: productData._id.toString(),
          name: productData.name,
          image: productData.image,
          price: texture.rate,
          area: item.area,
          selectedColor: item.selectedColor,
          selectedTexture: item.selectedTexture,
          quantity: item.quantity,
          height: item.height,
          width: item.width,
        },
      };
    });
    const totalPrice = formattedItems.reduce(
      (sum, i) =>
        sum + (i.product?.price || 0) * i.quantity * (i.product?.area || 1),
      0
    );
    await session.commitTransaction();
    session.endSession();
    return { items: formattedItems, totalPrice };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/****** Merge Guest Cart ******/
const mergeCart = async (guestCart: any, userId: string) => {
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
    const getProductId = (p: any) => (p._id ? p._id.toString() : p.toString());
    for (const guestItem of guestCart) {
      const product = await productRepository.findById(guestItem.productId);
      if (!product) continue;
      const existingItem = cart.items.find(
        (item) => getProductId(item?.product) === guestItem?.productId
      );
      if (existingItem) {
        cart.items = cart.items.filter(
          (item) => getProductId(item.product) !== guestItem.productId
        );
        if (guestItem.quantity > product.stock)
          throw new Apperror(`Only ${product.stock} items left in stock`, 400);
      }
      const texture = product.paperTextures?.find(
        (tex: any) => tex.name === guestItem.product.selectedTexture
      );
      if (!texture) throw new Apperror("Selected texture not found", 404);
      cart.items.push({
        product: guestItem.productId,
        quantity: guestItem.quantity,
        area: guestItem.product.area,
        selectedColor: guestItem.product.selectedColor,
        selectedTexture: guestItem.product.selectedTexture,
        name: guestItem.product.name,
        image: guestItem.product.image,
        height: guestItem.product.height,
        width: guestItem.product.width,
      });
    }

    await cartRepository.save(cart, session);
    const totalPrice = await calculateCartTotal(cart);
    const cartItemsIds = cart.items.map((item) => item.product._id.toString());
    const products = await Product.find({ _id: { $in: cartItemsIds } });
    const productMap = new Map<string, any>();
    products.forEach((p) => {
      productMap.set(p._id.toString(), p);
    });

    // Transform cart items into frontend-ready format
    const formattedItems = cart.items.map((item) => {
      const productData = productMap.get(item.product._id.toString());
      if (!productData) throw new Error("Product not found");
      const texture = productData.paperTextures?.find(
        (tex: any) => tex.name === item.selectedTexture
      );
      if (!texture) throw new Apperror("Selected texture not found", 404);
      return {
        productId: item.product._id.toString(),
        quantity: item.quantity,
        product: {
          _id: productData._id.toString(),
          name: productData.name,
          image: productData.image,
          price: texture.rate,
          area: item.area,
          selectedColor: item.selectedColor,
          selectedTexture: item.selectedTexture,
          quantity: item.quantity,
          height: item.height,
          width: item.width,
        },
      };
    });
    await session.commitTransaction();
    session.endSession();
    return { items: formattedItems, totalPrice };
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export default {
  addToCart,
  getCart,
  removeFromCart,
  mergeCart,
};
