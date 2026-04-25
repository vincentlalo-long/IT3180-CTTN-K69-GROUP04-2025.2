/**
 * Token Storage Utility
 */

const TOKEN_KEY = "accessToken";
const TOKEN_TYPE_KEY = "tokenType";
const USER_ROLE_KEY = "userRole";
const USER_EMAIL_KEY = "userEmail";
const USER_ID_KEY = "userId";
const USER_NAME_KEY = "userName";

/**
 * Lưu token và thông tin user vào localStorage
 */
export function saveTokenToStorage(
  token: string,
  userData: {
    type?: string;
    role?: string;
    email?: string;
    userId?: string;
    username?: string;
  } = {},
): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);

    if (userData.type) {
      localStorage.setItem(TOKEN_TYPE_KEY, userData.type);
    }

    if (userData.role) {
      localStorage.setItem(USER_ROLE_KEY, userData.role);
    }
    if (userData.email) {
      localStorage.setItem(USER_EMAIL_KEY, userData.email);
    }
    if (userData.userId) {
      localStorage.setItem(USER_ID_KEY, userData.userId);
    }
    if (userData.username) {
      localStorage.setItem(USER_NAME_KEY, userData.username);
    }

    console.log("Token đã được lưu thành công vào localStorage");
  } catch (error) {
    console.error("Lỗi lưu token:", error);
  }
}

/**
 * Lấy token từ localStorage
 */
export function getTokenFromStorage(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Lỗi lấy token:", error);
    return null;
  }
}

/**
 * Lấy thông tin user từ localStorage
 */
export function getUserFromStorage() {
  try {
    return {
      token: localStorage.getItem(TOKEN_KEY),
      type: localStorage.getItem(TOKEN_TYPE_KEY),
      role: localStorage.getItem(USER_ROLE_KEY),
      email: localStorage.getItem(USER_EMAIL_KEY),
      userId: localStorage.getItem(USER_ID_KEY),
      username: localStorage.getItem(USER_NAME_KEY),
    };
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error);
    return null;
  }
}

/**
 * Xóa token và thông tin user khỏi localStorage (logout)
 */
export function clearTokenFromStorage(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);

    console.log("Token đã được xóa khỏi localStorage");
  } catch (error) {
    console.error("Lỗi xóa token:", error);
  }
}

/**
 * Kiểm tra token có hợp lệ không (basic check)
 */
export function isTokenValid(): boolean {
  const token = getTokenFromStorage();
  return !!token && token.length > 0;
}

/**
 * Lấy token với định dạng Bearer
 */
export function getBearerToken(): string | null {
  const token = getTokenFromStorage();
  return token ? `Bearer ${token}` : null;
}
