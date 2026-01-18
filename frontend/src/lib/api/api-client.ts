import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export type HealthcheckResult = {
  ok: boolean;
  status: number;
  timestamp?: string;
  error?: string;
};

export class ApiClient {
  static async healthcheck(): Promise<HealthcheckResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: "Backend no disponible",
        };
      }

      const data: HealthcheckResult = await response.json();

      return data;
    } catch (error: unknown) {
    clearTimeout(timeout);
      const isAbort = error instanceof DOMException && error.name === "AbortError";

      return {
        ok: false,
        status: 500,
        error: isAbort
          ? "Timeout al conectar con el backend"
          : "No se pudo conectar con el backend",
      };
    }
  }

  static async fetcher<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
      Cookie: cookieHeader,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (response.status === 404) {
      return response.json();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error. Contacte al soporte" }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);       
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}