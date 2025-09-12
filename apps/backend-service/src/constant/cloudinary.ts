import dotenv from "dotenv";
dotenv.config();

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "your_api_key";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "your_api_secret";