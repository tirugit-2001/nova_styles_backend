import { v2 as cloudinary } from "cloudinary";
import config from "./config";

cloudinary.config({
  cloud_name: config.claudinary_cloud_name,
  api_key: config.claudinary_api_key,
  api_secret: config.claudinary_api_secret,
});

export const uploadImage = (
  fileBuffer: Buffer,
  folder = "wallpapers"
): Promise<any> => {
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
};

export const uploadBase64Image = async (
  base64String: string,
  folder = "portfolio"
): Promise<any> => {
  try {
    // Check if it's a data URL with prefix (data:image/jpeg;base64, or data:image/png;base64,)
    let mimeType = "image/png"; // default
    let base64Data = base64String;

    if (base64String.includes(",")) {
      const parts = base64String.split(",");
      const dataUrlPrefix = parts[0]; // e.g., "data:image/jpeg;base64"
      base64Data = parts[1];

      // Extract mime type from prefix
      if (dataUrlPrefix.includes("image/")) {
        const mimeMatch = dataUrlPrefix.match(/image\/([^;]+)/);
        if (mimeMatch) {
          mimeType = `image/${mimeMatch[1]}`;
        }
      }
    }

    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${base64Data}`,
      {
        folder,
        resource_type: "image",
      }
    );
    return result;
  } catch (error) {
    console.error("Error uploading base64 image:", error);
    throw error;
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
