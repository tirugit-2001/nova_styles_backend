import { deleteImage, uploadImage } from "../../../config/cloudinary";
import cloudinary from "../../../utils/cloudinary";
import { parsePaperTextures } from "../../../utils/helper";
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

    delete data.imageUrl;
    console.log(data.paperTextures, "service layer");

    if (data.paperTextures) {
      data.paperTextures = parsePaperTextures(data.paperTextures);
    }
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

  // Normalize paperTextures on update as well
  const parsePaperTextures = (value: any) => {
    if (!value) return [];
    let parsed: any = value;
    try {
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {
      // ignore
    }

    if (Array.isArray(parsed)) {
      return parsed
        .map((item: any) => {
          if (!item) return null;
          try {
            if (typeof item === "string") {
              item = JSON.parse(item);
            }
          } catch (e) {
            return null;
          }
          if (typeof item === "object") {
            return {
              name: item.name,
              rate: item.rate !== undefined ? Number(item.rate) : 0,
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (typeof parsed === "object") {
      return [
        {
          name: parsed.name,
          rate: parsed.rate !== undefined ? Number(parsed.rate) : 0,
        },
      ];
    }

    return [];
  };

  if (updateData.paperTextures) {
    updateData.paperTextures = parsePaperTextures(updateData.paperTextures);
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
