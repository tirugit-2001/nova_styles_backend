import { Request, Response, NextFunction } from "express";
import productService from "../service/product.service";
import Apperror from "../../../utils/apperror";
import { validate } from "../../../utils/validateschema";
import { productSchema } from "../../../utils/schemas/productschema";
/**********create product********/

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    console.log(req.file);
    const validatedData = validate(productSchema, req.body);
    const product = await productService.createProduct(validatedData, req.file);
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.log(err)
    next(err);
  }
};
/**********get  product********/
const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("inside get products controller");
    const products = await productService.getProducts();
    res.status(200).send({
      message: "Products fetched successfully",
      success: true,
      products,
    });
  } catch (err) {
    console.log(err)
    next(err);
  }
};
/**********get  product by id********/
const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};
/**********update   product********/
const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.file
    );
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    next(err);
  }
};
/**********delete  product********/
const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.params.id);
    const result = await productService.deleteProduct(req.params.id);
    console.log(result);

    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
