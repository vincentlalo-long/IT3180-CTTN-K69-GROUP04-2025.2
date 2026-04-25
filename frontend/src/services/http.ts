import axios, { AxiosHeaders } from "axios";
import { getBearerToken } from "../shared/utils/tokenStorage";

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const bearerToken = getBearerToken();

  if (bearerToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", bearerToken);
    config.headers = headers;
  }

  return config;
});
