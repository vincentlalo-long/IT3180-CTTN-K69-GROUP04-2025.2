import { z } from "zod";

export const securitySchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, "Mật khẩu mới cần ít nhất 8 ký tự."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mật khẩu mới và xác nhận mật khẩu chưa khớp.",
    path: ["confirmPassword"],
  });
