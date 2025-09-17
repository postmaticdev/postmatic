import { AxiosError } from "axios";

export const errorString = (e: unknown): string => {
  let errorMessage = "Terjadi kesalahan saat memproses data";
  if (e instanceof AxiosError) {
    errorMessage = e.response?.data.responseMessage || errorMessage;
  } else if (e instanceof Error) {
    errorMessage = e.message || errorMessage;
  }
  return errorMessage;
};
