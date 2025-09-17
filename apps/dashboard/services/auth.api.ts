import { api } from "@/config/api";
import {
  ProfilePld,
  ProfileRes,
  UpdatePasswordPld,
} from "@/models/api/auth/profile.type";
import { BaseResponse } from "@/models/api/base-response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const authProfileService = {
  getProfile: () => {
    return api.get<BaseResponse<ProfileRes>>(`/auth/profile`);
  },
  updateProfile: (formData: ProfilePld) => {
    return api.put<BaseResponse<ProfileRes>>("/auth/profile", formData);
  },
  logout: (refreshToken: string) => {
    return api.post<BaseResponse<null>>("/auth/profile/session/logout", {
      refreshToken,
    });
  },
  logoutAll: () => {
    return api.post<BaseResponse<null>>("/auth/profile/session/logout-all");
  },
  changePassword: (formData: UpdatePasswordPld) => {
    return api.patch<BaseResponse<null>>("/auth/profile", formData);
  },
};

export const useAuthProfileGetProfile = () => {
  return useQuery({
    queryKey: ["authProfile"],
    queryFn: () => authProfileService.getProfile(),
  });
};

export const useAuthProfileUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: ProfilePld) =>
      authProfileService.updateProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authProfile"] });
    },
  });
};

export const useAuthProfileLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refreshToken: string) =>
      authProfileService.logout(refreshToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authProfile"] });
    },
  });
};

export const useAuthProfileLogoutAll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authProfileService.logoutAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authProfile"] });
    },
  });
};

export const useAuthProfileChangePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: UpdatePasswordPld) =>
      authProfileService.changePassword(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authProfile"] });
    },
  });
};
