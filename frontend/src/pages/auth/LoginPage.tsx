import { Link } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { LoginForm } from "./LoginForm";
import { saveTokenToStorage } from "../../utils/tokenStorage";

// Khai báo kiểu dữ liệu payload nhận được từ LoginForm
interface LoginSubmitPayload {
  role: "owner" | "user";
  identifier: string;
  password: string;
}

export function LoginPage() {

  // Hàm xử lý gọi API khi user ấn nút đăng nhập
  const handleLogin = async (payload: LoginSubmitPayload) => {
    // 1. Chuyển đổi tên Role và các trường cho khớp với Backend Spring Boot
    console.log("Đã nhảy vào API!"); 
    const backendRole = payload.role === "owner" ? "admin" : "player";
    
    const loginData = {
      email: payload.identifier, // Đổi identifier thành email
      password: payload.password,
      role: backendRole
    };

    // 2. Gửi request xuống Backend
    const response = await fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
});

    // 3. Xử lý phản hồi từ Server
    if (response.ok) {
      const data = await response.json();
      
      // Đăng nhập thành công -> Lưu Token vào LocalStorage sử dụng utility
      saveTokenToStorage(data.token, {
        role: data.role,
        email: data.email,
        username: data.username,
      });
      
      console.log("Đăng nhập thành công, Token:", data.token);
      
      // Chú ý: Chúng ta KHÔNG cần gọi lệnh chuyển trang (navigate) ở đây
      // Vì bên trong file LoginForm của bạn đã có sẵn hàm navigate(redirectPath) rồi.
      
    } else {
      // Đăng nhập thất bại (sai mật khẩu, sai tư cách...)
      const errorMsg = await response.text();
      console.error("Lỗi đăng nhập:", errorMsg);
      
      // Ném ra lỗi (throw Error) để file LoginForm bắt được ở khối catch
      // Từ đó nó sẽ tự động hiển thị dòng chữ đỏ "Đăng nhập thất bại..." lên màn hình
      throw new Error(errorMsg || "Đăng nhập thất bại"); 
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-8">
        
        {/* Truyền hàm handleLogin vào LoginForm */}
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
