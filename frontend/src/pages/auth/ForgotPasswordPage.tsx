import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { TextInput } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { forgotPassword } from "../../features/auth/api/authApi";
import { MailCheck } from "lucide-react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Định dạng email chưa hợp lệ.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setIsSuccess(true);
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
            Quên mật khẩu
          </h1>
          <p className="text-auth-placeholder text-xs text-white/70">
            Chúng tôi sẽ gửi một liên kết khôi phục tới email của bạn.
          </p>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6 px-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <MailCheck className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white text-lg">Yêu cầu đã được gửi!</h3>
              <p className="text-sm text-white/80 leading-relaxed max-w-[320px]">
                Một email khôi phục mật khẩu đã được gửi đến <span className="font-semibold text-white">{email}</span>. Vui lòng kiểm tra hộp thư của bạn.
              </p>
            </div>
            <Link
              to="/login"
              className="mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              id="email"
              label="Địa chỉ Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="ten@email.com"
              error={error || undefined}
            />

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Gửi yêu cầu khôi phục
            </Button>
          </form>
        )}

        {!isSuccess && (
          <div className="mt-2">
            <Link
              to="/login"
              className="flex h-[48px] w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.01] text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition duration-200"
            >
              Nhớ ra mật khẩu? Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
