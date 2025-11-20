import portfolioRepository from "../repository/portfolio.repository";
import { uploadBase64Image, deleteImage } from "../../../config/cloudinary";
import Apperror from "../../../utils/apperror";

const createPortfolio = async (data: any) => {
  try {
    // Validate required fields
    if (!data.title || !data.location || !data.category) {
      throw new Apperror("Title, location, and category are required", 400);
    }

    // Check if image is base64 string or already a URL
    if (data.image && !data.image.startsWith("http")) {
      try {
        console.log("Uploading image to Cloudinary...");
        const uploadResult = await uploadBase64Image(data.image, "portfolio");
        if (!uploadResult || !uploadResult.secure_url) {
          throw new Apperror("Failed to upload image: No URL returned", 500);
        }
        data.image = uploadResult.secure_url;
        console.log("Image uploaded successfully:", uploadResult.secure_url);
      } catch (error: any) {
        console.error("Cloudinary upload error:", error);
        throw new Apperror(
          error.message || "Failed to upload image to Cloudinary",
          error.http_code || 500
        );
      }
    }

    if (!data.image) {
      throw new Apperror("Image is required", 400);
    }

    // Create portfolio in database
    console.log("Creating portfolio with data:", {
      title: data.title,
      location: data.location,
      category: data.category,
      image: data.image ? "Present" : "Missing",
    });

    const portfolio = await portfolioRepository.createPortfolio(data);
    return portfolio;
  } catch (error: any) {
    console.error("Error in createPortfolio:", error);
    // If it's already an Apperror, rethrow it
    if (error instanceof Apperror) {
      throw error;
    }
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      throw new Apperror(`Validation Error: ${messages.join(", ")}`, 400);
    }
    // Generic error
    throw new Apperror(
      error.message || "Failed to create portfolio",
      500
    );
  }
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

