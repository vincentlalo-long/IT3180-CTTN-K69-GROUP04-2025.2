import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../../shared/components/Button";
import { SocialIconButton } from "../../../shared/components/SocialIconButton";
import { TextInput } from "../../../shared/components/Input";
import eyeIcon from "../../../assets/icons/eye.svg";
import eyeOffIcon from "../../../assets/icons/eye-off.svg";
import facebookIcon from "../../../assets/icons/facebook.svg";
import googleIcon from "../../../assets/icons/google.svg";

export type LoginRole = "OWNER" | "PLAYER" | "ADMIN";

export interface LoginSubmitPayload {
  role: LoginRole;
  identifier: string;
  password: string;
}

interface LoginFormValues {
  identifier: string;
  password: string;
}

interface LoginFormErrors {
  identifier?: string;
  password?: string;
  global?: string;
}

interface LoginFormProps {
  onSubmit?: (payload: LoginSubmitPayload) => Promise<void> | void;
}

const EMAIL_OR_PHONE_REGEX = /^(?:\+?\d[\d\s-]{7,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

export function LoginForm({ onSubmit }: LoginFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const identifierPlaceholder = useMemo(() => "Email hoặc số điện thoại", []);

  const validate = (): LoginFormErrors => {
    const nextErrors: LoginFormErrors = {};

    if (!values.identifier.trim()) {
      nextErrors.identifier = "Vui lòng nhập email hoặc số điện thoại.";
    } else if (!EMAIL_OR_PHONE_REGEX.test(values.identifier.trim())) {
      nextErrors.identifier = "Định dạng email hoặc số điện thoại chưa hợp lệ.";
    }

    if (!values.password.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (values.password.trim().length < 6) {
      nextErrors.password = "Mật khẩu cần ít nhất 6 ký tự.";
    }

    return nextErrors;
  };

  const submitWithRole = async (role: LoginRole, redirectPath: string) => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({
          role,
          identifier: values.identifier.trim(),
          password: values.password.trim(),
        });
      } else {
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 900);
        });
      }

      navigate(redirectPath);
    } catch {
      setErrors({ global: "Đăng nhập thất bại. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void submitWithRole("ADMIN", "/admin");
  };

  const handleUserLogin = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void submitWithRole("PLAYER", "/");
  };

  return (
    <form className="w-full">
      <div className="mx-auto flex w-full max-w-[399px] flex-col gap-3.5">
        <TextInput
          id="identifier"
          label="Email hoặc số điện thoại"
          name="identifier"
          value={values.identifier}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              identifier: event.target.value,
            }))
          }
          placeholder={identifierPlaceholder}
          autoComplete="username"
          error={errors.identifier}
        />

        <div className="flex flex-col gap-1.5">
          <TextInput
            id="password"
            label="Mật khẩu"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            value={values.password}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Mật khẩu"
            autoComplete="current-password"
            error={errors.password}
            rightAdornment={
              <button
                type="button"
                onClick={() => setIsPasswordVisible((current) => !current)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 cursor-pointer"
                aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <img
                  src={isPasswordVisible ? eyeOffIcon : eyeIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </button>
            }
          />
          <div className="flex justify-end px-1">
            <Link
              to="/forgot-password"
              className="text-xs text-white/70 hover:text-white transition font-medium focus-visible:outline-none"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {/* 2 horizontal login buttons */}
        <div className="mt-1 flex gap-3">
          <Button
            type="button"
            onClick={handleAdminLogin}
            loading={isLoading}
            className="flex-1 h-[48px] text-[15px] px-2 rounded-xl"
          >
            Chủ sân
          </Button>

          <Button
            type="button"
            variant="outline-green"
            onClick={handleUserLogin}
            loading={isLoading}
            className="flex-1 h-[48px] text-[15px] px-2 rounded-xl"
          >
            Khách hàng
          </Button>
        </div>

        {errors.global ? (
          <p className="text-center text-sm font-medium text-red-300">
            {errors.global}
          </p>
        ) : null}

        {/* Premium Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">Hoặc</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Social login buttons */}
        <div className="flex items-center justify-center gap-3">
          <SocialIconButton
            iconSrc={googleIcon}
            label="Đăng nhập với Google"
          />
          <SocialIconButton
            iconSrc={facebookIcon}
            label="Đăng nhập với Facebook"
          />
        </div>
      </div>
    </form>
  );
}
