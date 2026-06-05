import { Link } from "react-router-dom";

import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterForm } from "../../features/auth/components/RegisterForm";
import { saveTokenToStorage } from "../../shared/utils/tokenStorage";
import { registerUser } from "../../features/auth/api/authApi";

// Khai báo kiểu dữ liệu payload nhận được từ RegisterForm
interface RegisterSubmitPayload {
  fullName: string;
  emailOrPhone: string;
  password: string;
}

export function RegisterPage() {
  const handleRegister = async (payload: RegisterSubmitPayload) => {
    const registerData = {
      username: payload.fullName,
      email: payload.emailOrPhone,
      password: payload.password,
      role: "PLAYER",
    };

    const data = await registerUser(registerData);

    if (data.token) {
      saveTokenToStorage(data.token, {
        type: data.type,
        role: data.role || "PLAYER",
        email: data.email || payload.emailOrPhone,
        username: data.username || payload.fullName,
      });
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-4">
        <div className="space-y-1.5 text-center">
          <h1 className="font-body text-[26px] font-bold text-white">
            Đăng ký tài khoản
          </h1>
          <p className="text-auth-placeholder text-xs text-white/70">
            Tạo tài khoản mới để bắt đầu sử dụng MIXIFOOT
          </p>
        </div>

        <RegisterForm onSubmit={handleRegister} />

        <div className="mt-2">
          <Link
            to="/login"
            className="flex h-[48px] w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.01] text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition duration-200"
          >
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
