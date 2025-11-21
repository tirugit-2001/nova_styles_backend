import portfolioRepository from "../repository/portfolio.repository";
import { uploadBase64Image, uploadImage, deleteImage } from "../../../config/cloudinary";
import Apperror from "../../../utils/apperror";

const createPortfolio = async (data: any, file?: Express.Multer.File) => {
  try {
    // Validate required fields
    if (!data.title || !data.location || !data.category) {
      throw new Apperror("Title, location, and category are required", 400);
    }

    // Prefer Multer file upload if provided
    if (file) {
      try {
        const uploadResult = await uploadImage(file.buffer, "portfolio");
        if (!uploadResult || !uploadResult.secure_url) {
          throw new Apperror("Failed to upload image: No URL returned", 500);
        }
        data.image = uploadResult.secure_url;
      } catch (error: any) {
        throw new Apperror(
          error.message || "Failed to upload image to Cloudinary",
          error.http_code || 500
        );
      }
    } else if (data.image && !data.image.startsWith("http")) {
      // Backward compatibility: handle base64 string payloads
      try {
        const uploadResult = await uploadBase64Image(data.image, "portfolio");
        if (!uploadResult || !uploadResult.secure_url) {
          throw new Apperror("Failed to upload image: No URL returned", 500);
        }
        data.image = uploadResult.secure_url;
      } catch (error: any) {
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

const updatePortfolio = async (id: string, data: any, file?: Express.Multer.File) => {
  // Get existing portfolio to check for image
  const existingPortfolio = await portfolioRepository.getPortfolioById(id);

  // If a new file is provided via Multer
  if (file) {
    // Delete old image from Cloudinary if present
    if (existingPortfolio.image) {
      await deleteImage(existingPortfolio.image);
    }
    // Upload new image
    const uploadResult = await uploadImage(file.buffer, "portfolio");
    data.image = uploadResult.secure_url;
  } else if (data.image && !data.image.startsWith("http")) {
    // Backward compatibility: handle base64 string
    try {
      if (existingPortfolio.image) {
        await deleteImage(existingPortfolio.image);
      }

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

  // Delete main image from Cloudinary
  if (portfolio.image) {
    await deleteImage(portfolio.image);
  }

  // Delete gallery images from Cloudinary
  if (portfolio.images && portfolio.images.length > 0) {
    for (const imageUrl of portfolio.images) {
      try {
        await deleteImage(imageUrl);
      } catch (error) {
        console.error("Failed to delete gallery image from Cloudinary:", error);
        // Continue deleting other images even if one fails
      }
    }
  }

  return await portfolioRepository.deletePortfolio(id);
};

const addSection = async (id: string, name: string) => {
  if (!name || !name.trim()) {
    throw new Apperror("Section name is required", 400);
  }
  const portfolio = await portfolioRepository.getPortfolioById(id);
  portfolio.sections.push({ name: name.trim(), images: [] });
  // @ts-ignore - mongoose document typing
  await portfolio.save();
  return portfolio;
};

const addSectionImages = async (
  id: string,
  sectionIndex: number,
  files: Express.Multer.File[]
) => {
  const portfolio = await portfolioRepository.getPortfolioById(id);
  if (
    typeof sectionIndex !== "number" ||
    sectionIndex < 0 ||
    sectionIndex >= portfolio.sections.length
  ) {
    throw new Apperror("Invalid section index", 400);
  }
  if (!files || files.length === 0) {
    throw new Apperror("No images provided", 400);
  }

  const uploadedUrls: string[] = [];
  for (const file of files) {
    const result = await uploadImage(file.buffer, "portfolio");
    uploadedUrls.push(result.secure_url);
  }

  portfolio.sections[sectionIndex].images.push(...uploadedUrls);
  // @ts-ignore
  await portfolio.save();
  return portfolio;
};

const getAllPortfoliosWithFilter = async (query: any) => {
  const filter: any = {};
  if (query.showOnMainHome === "true") filter.showOnMainHome = true;
  if (query.showOnInteriorHome === "true") filter.showOnInteriorHome = true;
  if (query.showOnConstruction === "true") filter.showOnConstruction = true;
  return await portfolioRepository.getAllPortfolios(filter);
};

const addPortfolioImages = async (
  id: string,
  files: Express.Multer.File[]
) => {
  const portfolio = await portfolioRepository.getPortfolioById(id);
  
  if (!portfolio) {
    throw new Apperror("Portfolio not found", 404);
  }
  
  if (!files || files.length === 0) {
    throw new Apperror("No images provided", 400);
  }

  const uploadedUrls: string[] = [];
  for (const file of files) {
    try {
      const result = await uploadImage(file.buffer, "portfolio");
      uploadedUrls.push(result.secure_url);
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      throw new Apperror(
        error.message || "Failed to upload image to Cloudinary",
        error.http_code || 500
      );
    }
  }

  // Initialize images array if it doesn't exist
  if (!portfolio.images) {
    portfolio.images = [];
  }
  
  portfolio.images.push(...uploadedUrls);
  // @ts-ignore
  await portfolio.save();
  return portfolio;
};

const deletePortfolioImage = async (id: string, imageUrl: string) => {
  const portfolio = await portfolioRepository.getPortfolioById(id);
  
  if (!portfolio) {
    throw new Apperror("Portfolio not found", 404);
  }
  
  if (!portfolio.images || !portfolio.images.includes(imageUrl)) {
    throw new Apperror("Image not found in portfolio", 404);
  }

  // Remove image from array
  portfolio.images = portfolio.images.filter((url: string) => url !== imageUrl);
  
  // Delete image from Cloudinary
  try {
    await deleteImage(imageUrl);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
    // Continue even if Cloudinary deletion fails
  }
  
  // @ts-ignore
  await portfolio.save();
  return portfolio;
};

export default {
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
  addSection,
  addSectionImages,
  getAllPortfoliosWithFilter,
  addPortfolioImages,
  deletePortfolioImage,
};

