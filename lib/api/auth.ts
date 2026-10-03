import { apiClient, API_URL } from "./client";
import { AuthResponse, LoginInput, MeResponse, RegisterInput } from "@/features/auth/types";

export async function getCsrfCookie(): Promise<void> {
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });
}

export const authApi = {
  getCsrfCookie,

  login: async (data: LoginInput): Promise<AuthResponse> => {
    await getCsrfCookie();
    return apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    await getCsrfCookie();
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
