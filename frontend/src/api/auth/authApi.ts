/**
 * Auth API Service
 * Tập trung xử lý tất cả API calls liên quan đến authentication
 */

import axios from "axios";
import { axiosInstance } from "../axiosInstance";

const AUTH_API_PREFIX = "/auth";

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData;
    }

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim().length > 0
    ) {
      return responseData.message;
    }

    return error.message;
  }

  return error instanceof Error ? error.message : "Lỗi kết nối";
}

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token?: string;
  type?: string;
  username?: string;
  email?: string;
  role?: string;
  userId?: string;
  success?: boolean;
  message?: string;
}

/**
 API log in
 */
export async function loginUser(loginData: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await axiosInstance.post<AuthResponse>(`${AUTH_API_PREFIX}/login`, loginData);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/*
  API register
 */
export async function registerUser(registerData: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      `${AUTH_API_PREFIX}/register`,
      registerData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Gọi API làm mới token (nếu backend hỗ trợ , không thì xóa sau)
 */
export async function refreshToken(oldToken: string): Promise<AuthResponse> {
  try {
    const response = await axiosInstance.post<AuthResponse>(`${AUTH_API_PREFIX}/refresh-token`, undefined, {
      headers: {
        Authorization: `Bearer ${oldToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
