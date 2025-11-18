import sharp from "sharp";

/**
 * Compresses an image buffer to reduce file size while maintaining quality
 * @param imageBuffer - The image buffer to compress
 * @param quality - JPEG quality (1-100, default: 80)
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @returns Compressed image buffer
 */
export const compressImage = async (
  imageBuffer: Buffer,
  quality: number = 80,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<Buffer> => {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Check if image has transparency (alpha channel)
    const hasAlpha = metadata.hasAlpha;
    const format = metadata.format;

    let processedImage = image.resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // Use appropriate format based on image type
    if (format === "png" && hasAlpha) {
      // Preserve transparency for PNGs with alpha channel
      return await processedImage
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();
    } else if (format === "webp") {
      // Optimize WebP images
      return await processedImage
        .webp({ quality, effort: 6 })
        .toBuffer();
    } else {
      // Convert to JPEG for photos (smallest file size)
      return await processedImage
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }
  } catch (error) {
    // If compression fails, return original buffer
    console.error("Image compression error:", error);
    return imageBuffer;
  }
};

/**
 * Compresses an image buffer with optimized settings for web
 * @param imageBuffer - The image buffer to compress
 * @returns Compressed image buffer
 */
export const compressImageForWeb = async (imageBuffer: Buffer): Promise<Buffer> => {
  return compressImage(imageBuffer, 75, 1920, 1920);
};

