import { api } from "@/config/api";
import { BaseResponse } from "@/models/api/base-response.type";
import {
  EditRolePld,
  MembersInvitePld,
  MembersInviteRes,
  MembersRes,
  ResendEmailPld,
} from "@/models/api/member/index.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const memberService = {
  getAllMembers: (businessId: string) => {
    return api.get<BaseResponse<MembersRes[]>>(
      `/member/business/${businessId}`
    );
  },
  invite: (businessId: string, formData: MembersInvitePld) => {
    return api.post<BaseResponse<MembersInviteRes>>(
      `/member/${businessId}`,
      formData
    );
  },
  resend: (businessId: string, formData: ResendEmailPld) => {
    return api.post<BaseResponse<MembersInviteRes>>(
      `/member/${businessId}/resend-email-invitation`,
      formData
    );
  },

  updateRole: (businessId: string, formData: EditRolePld) => {
    return api.put<BaseResponse<MembersInviteRes>>(
      `/member/${businessId}`,
      formData
    );
  },

  delete: (idData: string) => {
    return api.delete<BaseResponse<MembersInviteRes>>(
      `/member/${idData}`
    );
  },
};

export const useMemberGetAllMembers = (businessId: string) => {
  return useQuery({
    queryKey: ["members", businessId],
    queryFn: () => memberService.getAllMembers(businessId),
    enabled: !!businessId,
  });
};

export const useMemberInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: MembersInvitePld;
    }) => memberService.invite(businessId, formData),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ["members", data.data.rootBusinessId],
      });
    },
  });
};

export const useMemberResend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: ResendEmailPld;
    }) => memberService.resend(businessId, formData),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ["members", data.data.rootBusinessId],
      });
    },
  });
};

export const useMemberUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: EditRolePld;
    }) => memberService.updateRole(businessId, formData),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ["members", data.data.rootBusinessId],
      });
    },
  });
};

export const useMemberDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ["members", data.data.rootBusinessId],
      });
    },
    mutationFn: (idData: string) => memberService.delete(idData),
  });
};
