import { api } from "@/config/api";
import { BaseResponse } from "@/models/api/base-response.type";
import { UploadSingleImagePld } from "@/models/api/helper/image.type";

export const helperService = {
  uploadSingleImage: async (data: UploadSingleImagePld): Promise<string> => {
    // Add axios interceptor for multipart/form-data
    api.interceptors.request.use((config) => {
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      }
      return config;
    });
    try {
      const formData = new FormData();
      formData.append("image", data.image);

      const response = await api.post<BaseResponse<string>>(
        "/helper/image/single",
        formData
      );

      if (response.data.metaData.code !== 200) {
        throw new Error(
          response.data.responseMessage || "Failed to upload image"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  },
};