import { v2 as cloudinary } from "cloudinary";
import config from "./config";
import { compressImageForWeb } from "../utils/imageCompression";

// Validate Cloudinary configuration
if (!config.claudinary_cloud_name || !config.claudinary_api_key || !config.claudinary_api_secret) {
  console.warn("⚠️  Cloudinary configuration is missing. Image uploads will fail.");
  console.warn("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file");
} else {
  cloudinary.config({
    cloud_name: config.claudinary_cloud_name,
    api_key: config.claudinary_api_key,
    api_secret: config.claudinary_api_secret,
  });
  console.log("✅ Cloudinary configured successfully");
}

export const uploadImage = async (
  fileBuffer: Buffer,
  folder = "wallpapers"
): Promise<any> => {
  try {
    // Compress image before uploading
    const compressedBuffer = await compressImageForWeb(fileBuffer);
    
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(compressedBuffer);
    });
  } catch (error) {
    // If compression fails, upload original buffer
    console.error("Compression failed, uploading original image:", error);
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(fileBuffer);
    });
  }
};

export const uploadBase64Image = async (
  base64String: string,
  folder = "portfolio"
): Promise<any> => {
  // Check if Cloudinary is configured
  if (!config.claudinary_cloud_name || !config.claudinary_api_key || !config.claudinary_api_secret) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file"
    );
  }

  if (!base64String) {
    throw new Error("Base64 image string is required");
  }

  try {
    // Check if base64String already has data URL prefix
    if (base64String.startsWith("data:image")) {
      // Use the base64 string as-is (includes the data URL prefix)
      const result = await cloudinary.uploader.upload(base64String, {
        folder,
        resource_type: "image",
      });
      return result;
    } else {
      // If no prefix, assume it's just base64 data and add a generic prefix
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64String}`,
        {
          folder,
          resource_type: "image",
        }
      );
      return result;
    }
  } catch (error: any) {
    console.error("Error uploading base64 image to Cloudinary:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      response: error.response?.body,
    });
    throw new Error(
      `Failed to upload image to Cloudinary: ${error.message || "Unknown error"}`
    );
  }
};

export const deleteImage = async (imageUrl: string) => {
  if (!imageUrl) return;

  const segments = imageUrl.split("/");
  const fileNameWithExt = segments[segments.length - 1]; // abc123.jpg
  const publicId = `${segments[segments.length - 2]}/${
    fileNameWithExt.split(".")[0]
  }`;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete image:", err);
  }
};
