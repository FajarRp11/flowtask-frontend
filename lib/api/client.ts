export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken) {
      headers["X-XSRF-TOKEN"] = xsrfToken;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = data?.message || `HTTP error ${response.status}`;
    if (response.status === 422 && data?.errors) {
      message = data.message || "Validation failed";
    }
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}
