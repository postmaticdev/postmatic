import { BaseService } from "./BaseService";
import { CloudinaryService } from "./CloudinaryService";
import { ImageDTO } from "../validators/ImageValidator";

export class ImageService extends BaseService {
  constructor(private cloudinary: CloudinaryService) {
    super();
  }
  async uploadSingle(data: Express.Multer.File) {
    try {
      const imageUrl = await this.cloudinary.uploadImage(data);
      return imageUrl;
    } catch (err) {
      this.handleError("ImageService.uploadSingle", err);
    }
  }

  async uploadMultiple(data: Express.Multer.File[]) {
    try {
      const imageUrls = await this.cloudinary.uploadMultipleImages(data);
      return imageUrls;
    } catch (err) {
      this.handleError("ImageService.uploadMultiple", err);
    }
  }

  async deleteImage(data: ImageDTO) {
    try {
      await this.cloudinary.deleteImage(data.url);
    } catch (err) {
      this.handleError("ImageService.deleteImage", err);
    }
  }
}
