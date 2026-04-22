import { Link } from "react-router-dom";

import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterForm } from "./RegisterForm";
import { saveTokenToStorage } from "../../utils/tokenStorage";
import { registerUser } from "../../api/auth/authApi";

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
        role: data.role || "PLAYER",
        email: data.email || payload.emailOrPhone,
        username: data.username || payload.fullName,
      });
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="font-display text-[32px] font-normal text-white">
            Đăng ký tài khoản
          </h1>
          <p className="text-auth-placeholder text-sm">
            Tạo tài khoản mới để bắt đầu sử dụng MIXIFOOT
          </p>
        </div>

        <RegisterForm onSubmit={handleRegister} />

        <p className="text-center text-sm text-white/85">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-auth-link text-white font-medium hover:text-white/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
