import axios, { AxiosHeaders } from "axios";
import {
  clearTokenFromStorage,
  getBearerToken,
} from "@/shared/utils/tokenStorage";

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use((config) => {
  const bearerToken = getBearerToken();

  if (bearerToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", bearerToken);
    config.headers = headers;
  }

  return config;
});

// Response Interceptor: Handle 401 Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearTokenFromStorage();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
