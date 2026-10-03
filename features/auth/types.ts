import { z } from "zod";

export interface User {
  id: string | number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
}

export interface MeResponse {
  user: User;
}

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi").max(255, "Nama terlalu panjang"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    password_confirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["password_confirmation"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
