import { IHero } from "../../../models/hero.schema";
import cloudinary from "../../../utils/cloudinary";
import * as heroRepo from "../repository/hero.repository";

export const createHero = async (data: Partial<IHero>) => {
  try {
    // If image is base64, upload to Cloudinary
    if (data.image && data.image.startsWith('data:image')) {
      const uploadResult = await cloudinary.uploader.upload(data.image, {
        folder: 'hero-sections',
        resource_type: 'image'
      });
      data.image = uploadResult.secure_url;
    }

    return await heroRepo.createHero(data);
  } catch (error: any) {
    throw new Error(`Failed to create hero: ${error.message}`);
  }
};

export const getHero = async () => {
  return await heroRepo.getAllHeros();
};

export const updateHero = async (id: string, data: Partial<IHero>) => {
  try {
    // If new image is base64, upload to Cloudinary
    if (data.image && data.image.startsWith('data:image')) {
      // First, get the old hero to delete old image
      const oldHero = await heroRepo.getHeroById(id);
      
      if (oldHero && oldHero.image && oldHero.image.includes('cloudinary')) {
        // Extract public_id from Cloudinary URL
        const urlParts = oldHero.image.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `hero-sections/${fileWithExt.split('.')[0]}`;
        
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting old image from Cloudinary:', err);
        }
      }

      // Upload new image
      const uploadResult = await cloudinary.uploader.upload(data.image, {
        folder: 'hero-sections',
        resource_type: 'image'
      });
      data.image = uploadResult.secure_url;
    }

    return await heroRepo.updateHero(id, data);
  } catch (error: any) {
    throw new Error(`Failed to update hero: ${error.message}`);
  }
};

export const deleteHero = async (id: string) => {
  try {
    // Get hero first to access image URL
    const hero = await heroRepo.getHeroById(id);
    
    // Delete image from Cloudinary if it exists
    if (hero && hero.image && hero.image.includes('cloudinary')) {
      // Extract public_id from Cloudinary URL
      const urlParts = hero.image.split('/');
      const fileWithExt = urlParts[urlParts.length - 1];
      const publicId = `hero-sections/${fileWithExt.split('.')[0]}`;
      
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }
    
    // Delete hero from database
    return await heroRepo.deleteHero(id);
  } catch (error: any) {
    throw new Error(`Failed to delete hero: ${error.message}`);
  }
};