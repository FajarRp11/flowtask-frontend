import { apiClient } from "./client";
import { AuthResponse, LoginInput, MeResponse, RegisterInput } from "@/features/auth/types";

export const authApi = {
  login: (data: LoginInput): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register: (data: RegisterInput): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me: (): Promise<MeResponse> => {
    return apiClient<MeResponse>("/auth/me", {
      method: "GET",
    });
  },

  logout: (): Promise<{ message: string }> => {
    return apiClient<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },
};
