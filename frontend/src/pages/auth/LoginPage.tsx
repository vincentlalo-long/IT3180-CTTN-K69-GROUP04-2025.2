import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { saveTokenToStorage } from "../../shared/utils/tokenStorage";
import { loginUser, loginWithGoogle } from "../../features/auth/api/authApi";
import { useAuthContext } from "../../features/auth/hooks/useAuthContext";

// Khai báo kiểu dữ liệu payload nhận được từ LoginForm
interface LoginSubmitPayload {
  role: "OWNER" | "PLAYER" | "ADMIN";
  identifier: string;
  password: string;
}

export function LoginPage() {
  const { checkAuth } = useAuthContext();
  const navigate = useNavigate();

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
      userId: data.id?.toString(),
      username: data.username,
    });

    checkAuth();
  };

  const handleGoogleSuccess = async (idToken: string) => {
    const data = await loginWithGoogle(idToken);
    if (!data.token) {
      throw new Error("Đăng nhập Google thất bại");
    }

    saveTokenToStorage(data.token, {
      type: data.type,
      role: data.role,
      email: data.email,
      userId: data.id?.toString(),
      username: data.username,
    });

    checkAuth();
    navigate("/");
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-4">
        <div className="space-y-1.5 text-center">
          <h1 className="font-body text-[26px] font-bold text-white">
            Đăng nhập
          </h1>
          <p className="text-auth-placeholder text-xs text-white/70">
            Chào mừng bạn quay lại với MIXIFOOT
          </p>
        </div>

        <LoginForm onSubmit={handleLogin} onGoogleSuccess={handleGoogleSuccess} />

        <div className="mt-2">
          <Link
            to="/register"
            className="flex h-[48px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition duration-200"
          >
            Chưa có tài khoản? Đăng ký ngay
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
