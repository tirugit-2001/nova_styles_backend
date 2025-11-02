import { deleteImage, uploadImage } from "../../../config/cloudinary";
import Apperror from "../../../utils/apperror";
import contentRepository from "../repository/content.repository";

const createContent = async (data: any, file?: Express.Multer.File) => {
  if (!file) {
    throw new Apperror("image is required ", 401);
  }
  const uploadResult: any = await uploadImage(file.buffer);
  data.image = uploadResult.secure_url;
  return await contentRepository.createSection(data);
};

const getContentBySection = async (section: string) => {
  return await contentRepository.findSection(section);
};
const getContentById = async (id: string) => {
  return await contentRepository.findById(id);
};

const updateContent = async (
  id: string,
  data: any,
  file?: Express.Multer.File
) => {
  const existingData = await contentRepository.findById(id);
  if (!existingData) {
    throw new Apperror("itme not found", 404);
  }

  if (file && existingData?.image) {
    await deleteImage(existingData.image);

    const uploadResult: any = await uploadImage(file.buffer);
    data.image = uploadResult.secure_url;
  }
  return await contentRepository.updateContent(id, data);
};

const deleteContent = async (id: string) => {
  await contentRepository.deleteContent(id);
  return true;
};

const postContact = async (data: any) => {};
export default {
  createContent,
  getContentBySection,
  updateContent,
  deleteContent,
  getContentById,
};
