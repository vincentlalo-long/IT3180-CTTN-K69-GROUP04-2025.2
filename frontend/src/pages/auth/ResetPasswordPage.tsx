import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { TextInput } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { resetPassword } from "../../features/auth/api/authApi";
import { ShieldCheck } from "lucide-react";
import eyeIcon from "../../assets/icons/eye.svg";
import eyeOffIcon from "../../assets/icons/eye-off.svg";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token khôi phục mật khẩu không tìm thấy hoặc không hợp lệ.");
    }
  }, [token]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      navigate("/login");
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Yêu cầu khôi phục không hợp lệ do thiếu token.");
      return;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu mới cần ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-4">
        <div className="space-y-1.5 text-center">
          <h1 className="font-body text-[26px] font-bold text-white">
            Đặt lại mật khẩu
          </h1>
          <p className="text-auth-placeholder text-xs text-white/70">
            Tạo một mật khẩu mới an toàn cho tài khoản MIXIFOOT của bạn.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 px-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white text-lg">Đổi mật khẩu thành công!</h3>
              <p className="text-sm text-white/80 leading-relaxed max-w-[320px]">
                Mật khẩu của bạn đã được cập nhật. Bạn sẽ tự động chuyển hướng về trang Đăng nhập sau <span className="font-bold text-emerald-400">{countdown}s</span>...
              </p>
            </div>
            <Link
              to="/login"
              className="mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              id="password"
              label="Mật khẩu mới"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nhập mật khẩu mới"
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <img
                    src={showPassword ? eyeOffIcon : eyeIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </button>
              }
            />

            <TextInput
              id="confirmPassword"
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Xác nhận mật khẩu mới"
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <img
                    src={showConfirmPassword ? eyeOffIcon : eyeIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </button>
              }
            />

            {error && (
              <p className="text-sm font-medium text-red-300 text-center bg-red-500/10 border border-red-500/20 py-2.5 px-4 rounded-xl">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={isLoading}
              disabled={!token}
              className="w-full mt-2"
            >
              Cập nhật mật khẩu
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
