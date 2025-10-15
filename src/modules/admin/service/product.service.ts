import { deleteImage, uploadImage } from "../../../config/cloudinary";
import productRepository from "../../products/repository/product.repository";

const createProduct = async (data: any, file?: Express.Multer.File) => {
  if (file) {
    const uploadResult: any = await uploadImage(file.buffer);
    data.imageUrl = uploadResult.secure_url;
  }
  return await productRepository.create(data);
};

/******** update product*******/
const updateProduct = async (
  id: string,
  data: any,
  file?: Express.Multer.File
) => {
  const existingProduct: any = await productRepository.findById(id);
  if (!existingProduct) throw new Error("Product not found");

  if (file && existingProduct.imageUrl) {
    await deleteImage(existingProduct.imageUrl);

    const uploadResult: any = await uploadImage(file.buffer);
    data.imageUrl = uploadResult.secure_url;
  }

  return await productRepository.update(id, data);
};

/******** delete product*******/
const deleteProduct = async (id: string) => {
  return await productRepository.remove(id);
};
