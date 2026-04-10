import { Link } from "react-router-dom";

import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterForm } from "./RegisterForm";

export function RegisterPage() {
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

        <RegisterForm />

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
