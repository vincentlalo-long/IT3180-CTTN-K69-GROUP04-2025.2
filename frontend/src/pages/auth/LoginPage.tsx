import { Link } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { saveTokenToStorage } from "../../shared/utils/tokenStorage";
import { loginUser } from "../../features/auth/api/authApi";

// Khai báo kiểu dữ liệu payload nhận được từ LoginForm
interface LoginSubmitPayload {
  role: "OWNER" | "PLAYER" | "ADMIN";
  identifier: string;
  password: string;
}

export function LoginPage() {
  const handleLogin = async (payload: LoginSubmitPayload) => {
    const loginData = {
      email: payload.identifier,
      password: payload.password,
      role: payload.role,
    };

    const data = await loginUser(loginData);
    if (!data.token) {
      throw new Error("Dang nhap that bai");
    }

    saveTokenToStorage(data.token, {
      type: data.type,
      role: data.role,
      email: data.email,
      username: data.username,
    });
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-8">
        <LoginForm onSubmit={handleLogin} />

        <p className="text-center text-sm text-white/85">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-auth-link text-white font-medium hover:text-white/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
