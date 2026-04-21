import { Link } from "react-router-dom";

import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterForm } from "./RegisterForm";
import { saveTokenToStorage } from "../../utils/tokenStorage";

// Khai báo kiểu dữ liệu payload nhận được từ RegisterForm
interface RegisterSubmitPayload {
  fullName: string;
  emailOrPhone: string;
  password: string;
}

export function RegisterPage() {
  // Hàm xử lý gọi API khi user ấn nút đăng ký
  const handleRegister = async (payload: RegisterSubmitPayload) => {
    console.log("Gọi API đăng ký");

    // Chuyển đổi dữ liệu để khớp với Backend Spring Boot
    const registerData = {
      username: payload.fullName, // Backend sử dụng username, frontend gọi là fullName
      email: payload.emailOrPhone, // Email hoặc số điện thoại
      password: payload.password,
      role: "player", // Người dùng mới mặc định là player
    };

    // Gửi request đăng ký xuống Backend
    const response = await fetch("http://localhost:8080/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    // Xử lý phản hồi từ Server
    if (response.ok) {
      const data = await response.json();

      // 1. Nếu Backend trả về token sau đăng ký
      if (data.token) {
        // Lưu token và thông tin user vào localStorage
        saveTokenToStorage(data.token, {
          role: data.role || "player",
          email: data.email || payload.emailOrPhone,
          username: data.username || payload.fullName,
        });

        console.log("Đăng ký thành công, Token:", data.token);
      } else {
        // 2. Nếu Backend chồng trả về token, chuyển hướng đến trang đăng nhập
        console.log("Đăng ký thành công, vui lòng đăng nhập");
      }

      // Chú ý: Không cần gọi navigate ở đây
      // Vì file RegisterForm đã có navigate rồi
    } else {
      // Đăng ký thất bại
      const errorMsg = await response.text();
      console.error("Lỗi đăng ký:", errorMsg);

      // Ném ra lỗi để file RegisterForm bắt được ở khối catch
      throw new Error(errorMsg || "Đăng ký thất bại");
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

        {/* Truyền hàm handleRegister vào RegisterForm */}
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
