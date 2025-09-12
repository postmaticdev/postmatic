import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(4, "Name is required"),
  countryCode: z.string().startsWith("+", "Country code must start with +"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  image: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type ProfileDTO = z.infer<typeof ProfileSchema>;

export const PasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password is required"),
  newPassword: z.string().min(6, "New password is required"),
});

export type PasswordDTO = z.infer<typeof PasswordSchema>;

export const SignInValidator = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export type SignInDTO = z.infer<typeof SignInValidator>;

export const SignUpValidator = z
  .object({
    givenName: z.string().min(2, "Given name is required"),
    familyName: z.string().min(2, "Family name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignUpDTO = z.infer<typeof SignUpValidator>;

export const ResetPassword1Schema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ResetPassword1DTO = z.infer<typeof ResetPassword1Schema>;

export const ResetPasswordDecodedSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  type: z.literal("reset-password"),
  profileId: z.string().min(1, "Profile ID is required"),
});

export type ResetPasswordDecodedDTO = z.infer<
  typeof ResetPasswordDecodedSchema
>;

export const ResetPassword2Schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type ResetPassword2DTO = z.infer<typeof ResetPassword2Schema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
