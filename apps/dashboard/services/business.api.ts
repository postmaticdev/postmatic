import { api } from "@/config/api";
import {
  BaseResponse,
  BaseResponseFiltered,
  FilterQuery,
} from "@/models/api/base-response.type";
import {
  BusinessDetailRes,
  BusinessRes,
  BussinessPld,
} from "@/models/api/business/index.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const businessService = {
  getAll: (filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponseFiltered<BusinessRes[]>>("/business", {
      params: filterQuery,
    });
  },
  getById: (idData: string) => {
    if (!idData) return;
    return api.get<BaseResponse<BusinessDetailRes>>(`/business/${idData}`);
  },
  create: (formData: BussinessPld) => {
    return api.post<BaseResponse<BusinessRes>>(`/business`, formData);
  },
  update: (idData: string, formData: BussinessPld) => {
    return api.put<BaseResponse<BusinessRes>>(`/business/${idData}`, formData);
  },
  delete: (idData: string) => {
    return api.delete<BaseResponse<BusinessRes>>(`/business/${idData}`);
  },
  outBusiness: (idData: string) => {
    return api.delete<BaseResponse<BusinessRes>>(`/business/${idData}/out`);
  },
};

export const countBusiness = async () => {
  const res = await businessService.getAll();
  return res.data.data.length;
};

export const useBusinessGetAll = (filterQuery?: Partial<FilterQuery>) =>
  useQuery({
    queryKey: ["businesses", filterQuery],
    queryFn: () =>
      businessService.getAll({
        ...filterQuery,
        // Use the limit from filterQuery, default to 10 if not provided
        limit: filterQuery?.limit || 10,
      }),
  });

export const useBusinessGetById = (idData: string) =>
  useQuery({
    queryKey: ["business", idData],
    queryFn: () => businessService.getById(idData),
    enabled: !!idData,
  });

export const useBusinessCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: BussinessPld) => businessService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useBusinessUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      idData,
      formData,
    }: {
      idData: string;
      formData: BussinessPld;
    }) => businessService.update(idData, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
};

export const useBusinessDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idData: string) => businessService.delete(idData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
};

export const useBusinessOutBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idData: string) => businessService.outBusiness(idData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
};
