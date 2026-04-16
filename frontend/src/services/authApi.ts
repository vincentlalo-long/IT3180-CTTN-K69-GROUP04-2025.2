/**
 * Auth API Service
 * Tập trung xử lý tất cả API calls liên quan đến authentication
 */

const API_BASE_URL = "http://localhost:8080/auth";

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
  token: string;
  type?: string;
  username?: string;
  email?: string;
  role?: string;
  userId?: string;
}

/**
 API log in
 */
export async function loginUser(loginData: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || "Đăng nhập thất bại");
    }

    const data = await response.json() as AuthResponse;
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi kết nối";
    throw new Error(message);
  }
}

/*
  API register
 */
export async function registerUser(registerData: RegisterRequest): Promise<AuthResponse | { message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || "Đăng ký thất bại");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi kết nối";
    throw new Error(message);
  }
}

/**
 * Gọi API làm mới token (nếu backend hỗ trợ , không thì xóa sau)
 */
export async function refreshToken(oldToken: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${oldToken}`,
      },
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || "Không thể làm mới token");
    }

    const data = await response.json() as AuthResponse;
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi kết nối";
    throw new Error(message);
  }
}
