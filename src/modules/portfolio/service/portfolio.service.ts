import portfolioRepository from "../repository/portfolio.repository";
import { uploadBase64Image, deleteImage } from "../../../config/cloudinary";
import Apperror from "../../../utils/apperror";

const createPortfolio = async (data: any) => {
  // Check if image is base64 string or already a URL
  if (data.image && !data.image.startsWith("http")) {
    try {
      const uploadResult = await uploadBase64Image(data.image, "portfolio");
      data.image = uploadResult.secure_url;
    } catch (error) {
      throw new Apperror("Failed to upload image to Cloudinary", 500);
    }
  }

  if (!data.image) {
    throw new Apperror("Image is required", 400);
  }

  return await portfolioRepository.createPortfolio(data);
};

const getAllPortfolios = async () => {
  return await portfolioRepository.getAllPortfolios();
};

const getPortfolioById = async (id: string) => {
  return await portfolioRepository.getPortfolioById(id);
};

const updatePortfolio = async (id: string, data: any) => {
  // Get existing portfolio to check for image
  const existingPortfolio = await portfolioRepository.getPortfolioById(id);

  // If new image is provided and it's base64
  if (data.image && !data.image.startsWith("http")) {
    try {
      // Delete old image from Cloudinary
      if (existingPortfolio.image) {
        await deleteImage(existingPortfolio.image);
      }

      // Upload new image
      const uploadResult = await uploadBase64Image(data.image, "portfolio");
      data.image = uploadResult.secure_url;
    } catch (error) {
      throw new Apperror("Failed to upload image to Cloudinary", 500);
    }
  } else if (!data.image) {
    // If no image provided, keep the existing one
    data.image = existingPortfolio.image;
  }

  return await portfolioRepository.updatePortfolio(id, data);
};

const deletePortfolio = async (id: string) => {
  // Get portfolio to get image URL before deletion
  const portfolio = await portfolioRepository.getPortfolioById(id);

  // Delete image from Cloudinary
  if (portfolio.image) {
    await deleteImage(portfolio.image);
  }

  return await portfolioRepository.deletePortfolio(id);
};

export default {
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
};

