import { Link } from "react-router-dom";

import { AuthLayout } from "../../layouts/AuthLayout";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-8">
        <LoginForm />

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
