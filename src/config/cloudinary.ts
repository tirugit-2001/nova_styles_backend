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
