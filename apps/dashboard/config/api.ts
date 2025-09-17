import {
  ACCESS_TOKEN_KEY,
  LOGIN_URL,
  NEXT_PUBLIC_API_ORIGIN,
  REFRESH_TOKEN_KEY,
} from "@/constants";
import { BaseResponse } from "@/models/api/base-response.type";
// import { BaseResponse } from "@/models/api/base-response.type";
import axios, { AxiosError } from "axios";

const MINUTE = 60000;
export const api = axios.create({
  baseURL: NEXT_PUBLIC_API_ORIGIN + "/api",
  timeout: MINUTE * 2,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear token and redirect to login
      const handleRefreshTokenResponse = await handleRefreshToken();
      if (handleRefreshTokenResponse?.data && error.config) {
        localStorage.setItem(
          ACCESS_TOKEN_KEY,
          handleRefreshTokenResponse?.data?.accessToken
        );
        localStorage.setItem(
          REFRESH_TOKEN_KEY,
          handleRefreshTokenResponse?.data?.refreshToken
        );
        return api.request(error.config);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = LOGIN_URL;
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (
  accessToken: string | null,
  refreshToken: string | null
) => {
  if (accessToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

const handleRefreshToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (refreshToken) {
    const response = await api.post<
      BaseResponse<{ accessToken: string; refreshToken: string }>
    >("/auth/callback/refresh", {
      refreshToken,
    });
    if (response.data.data) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.data.refreshToken);
    }
    return response.data;
  }
  return null;
};
