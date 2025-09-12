import { z } from "zod";

export const MemberSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  role: z.enum(["Admin", "Member"]),
});

export type MemberDTO = z.infer<typeof MemberSchema>;

export const MemberDecodedSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  rootBusinessId: z.string().min(1, "Root business ID is required"),
  businessName: z.string().min(1, "Business name is required"),
  role: z.enum(["Admin", "Member"]),
  type: z.enum(["email-verification"]).default("email-verification"),
  profileId: z.string().min(1, "Profile ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
});

export type MemberDecodedDTO = z.infer<typeof MemberDecodedSchema>;

export const MemberEditSchema = z.object({
  role: z.enum(["Admin", "Member"]),
  memberId: z.string().min(1, "Member ID is required"),
});

export type MemberEditDTO = z.infer<typeof MemberEditSchema>;

export const ResendEmailInvitationSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
});

export type ResendEmailInvitationDTO = z.infer<
  typeof ResendEmailInvitationSchema
>;
