import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { BaseService } from "./BaseService";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../constant/cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // folder: "postmatic",
    // allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    public_id: (req, file) => {
      return `${file.fieldname}-${Date.now()}`;
    },
  },
});

// Konfigurasi multer
export const upload = multer({ storage: storage });

// Service untuk upload gambar
export class CloudinaryService extends BaseService {
  constructor() {
    super();
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  // Upload single image
  public async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path);
      return result.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  // Upload multiple images
  public async uploadMultipleImages(
    files: Express.Multer.File[]
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw new Error("Failed to upload multiple images");
    }
  }

  // Delete image
  public async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = imageUrl?.split("/")?.slice?.(-1)?.[0]?.split(".")?.[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }

  public async saveImageFromUrl(imageUrl: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(imageUrl);
      return result.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }
}
