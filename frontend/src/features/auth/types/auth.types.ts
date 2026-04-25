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

/**
 * Unified response for authentication failures and non-token auth responses.
 */
export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: string;
}
