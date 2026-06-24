import axios from "axios";

import { apiClient } from "@/shared/api/apiClient";
import type {
  AuthResponse,
  JwtResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.types";

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

export async function loginUser(loginData: LoginRequest): Promise<JwtResponse> {
  try {
    const response = await apiClient.post<JwtResponse>(
      `${AUTH_API_PREFIX}/login`,
      loginData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function registerUser(
  registerData: RegisterRequest,
): Promise<JwtResponse> {
  try {
    const response = await apiClient.post<JwtResponse>(
      `${AUTH_API_PREFIX}/register`,
      registerData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function refreshToken(
  oldToken: string,
): Promise<JwtResponse | AuthResponse> {
  try {
    const response = await apiClient.post<JwtResponse>(
      `${AUTH_API_PREFIX}/refresh-token`,
      undefined,
      {
        headers: {
          Authorization: `Bearer ${oldToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post(`${AUTH_API_PREFIX}/logout`);
  } catch (error) {
    console.error("Logout API failed:", error);
    throw new Error(getApiErrorMessage(error));
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await apiClient.post(`${AUTH_API_PREFIX}/forgot-password`, { email });
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  try {
    await apiClient.post(`${AUTH_API_PREFIX}/reset-password`, {
      token,
      newPassword,
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function loginWithGoogle(
  idToken: string,
): Promise<JwtResponse> {
  try {
    const response = await apiClient.post<JwtResponse>(
      `${AUTH_API_PREFIX}/google`,
      { idToken },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
