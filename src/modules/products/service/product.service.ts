import { deleteImage, uploadImage } from "../../../config/cloudinary";
import cloudinary from "../../../utils/cloudinary";
import productRepository from "../repository/product.repository";

/******** create product*******/
const createProduct = async (data: any, file?: Express.Multer.File) => {
  try{
    if(data.imageUrl && data.imageUrl.startsWith('data:image')){
      const uploadResult = await cloudinary.uploader.upload(data.imageUrl,{
        folder:'product-sections',
        resource_type:'image'
      });
      data.image = uploadResult.secure_url
    }
    return await productRepository.create(data);
  }catch(error:any){
    throw new Error(`Failed to create product: ${error.message}`)
  }
};
/******** get all products*******/
const getProducts = async () => {
  return await productRepository.findAll();
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

  if (file && existingProduct.image) {
    await deleteImage(existingProduct.image);

    const uploadResult: any = await uploadImage(file.buffer);
    data.imageUrl = uploadResult.secure_url;
  }

  return await productRepository.update(id, data);
};

/******** delete product*******/
const deleteProduct = async (id: string) => {
  return await productRepository.remove(id);
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
