import dotenv from "dotenv";
dotenv.config();

export const REDIS_HOST = process.env.REDIS_HOST || "localhost"; 
export const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
