import { deleteImage, uploadImage } from "../../../config/cloudinary";
import cloudinary from "../../../utils/cloudinary";
import productRepository from "../repository/product.repository";

/******** create product*******/
const createProduct = async (data: any, file?: Express.Multer.File) => {
  try {
    if (file) {
      const uploadResult = await uploadImage(file.buffer, "product-sections");
      data.image = uploadResult.secure_url;
    } else if (data.imageUrl && data.imageUrl.startsWith("data:image")) {
      const uploadResult = await cloudinary.uploader.upload(data.imageUrl, {
        folder: "product-sections",
        resource_type: "image",
      });
      data.image = uploadResult.secure_url;
    }

    // Convert isTrending from string to boolean if needed
    if (data.isTrending !== undefined) {
      if (typeof data.isTrending === "string") {
        data.isTrending = data.isTrending === "true";
      }
    }

    // clean up temp fields
    delete data.imageUrl;

    return await productRepository.create(data);
  } catch (error: any) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
};
/******** get all products*******/
const getProducts = async (page: number, limit: number) => {
  return await productRepository.findAll(page, limit);
};
/******** get product by id*******/
const getProductById = async (id: string) => {
  return await productRepository.findById(id);
};
/******** update product*******/
const updateProduct = async (
  id: string,
  data: any,
  file?: Express.Multer.File
) => {
  const existingProduct: any = await productRepository.findById(id);
  if (!existingProduct) throw new Error("Product not found");

  const updateData = data ? { ...data } : {};

  // Convert isTrending from string to boolean if needed
  if (updateData.isTrending !== undefined) {
    if (typeof updateData.isTrending === "string") {
      updateData.isTrending = updateData.isTrending === "true";
    }
  }

  if (file) {
    if (existingProduct.image) {
      await deleteImage(existingProduct.image);
    }
    const uploadResult: any = await uploadImage(
      file.buffer,
      "product-sections"
    );
    updateData.image = uploadResult.secure_url;
  } else if (
    updateData.imageUrl &&
    typeof updateData.imageUrl === "string" &&
    updateData.imageUrl.startsWith("data:image")
  ) {
    if (existingProduct.image) {
      await deleteImage(existingProduct.image);
    }
    const uploadResult = await cloudinary.uploader.upload(updateData.imageUrl, {
      folder: "product-sections",
      resource_type: "image",
    });
    updateData.image = uploadResult.secure_url;
  }

  if (updateData.imageUrl) {
    delete updateData.imageUrl;
  }

  return await productRepository.update(id, updateData);
};
/******** delete product*******/
const deleteProduct = async (id: string) => {
  const existingProduct: any = await productRepository.findById(id);
  if (!existingProduct) throw new Error("Product not found");
  if (existingProduct.image) {
    await deleteImage(existingProduct.image);
  }
  return await productRepository.remove(id);
};
/******** get trending products*******/
const getTrendingProducts = async () => {
  return await productRepository.findTrending();
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
};
