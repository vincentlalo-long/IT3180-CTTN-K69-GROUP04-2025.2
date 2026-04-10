import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";

interface RegisterFormValues {
  fullName: string;
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  fullName?: string;
  emailOrPhone?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_OR_PHONE_REGEX = /^(?:\+?\d[\d\s-]{7,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

export function RegisterForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: "",
    emailOrPhone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof RegisterFormValues;

    setValues((current) => ({
      ...current,
      [fieldName]: value,
    }));

    setErrors((current) => {
      const errorKey = fieldName as keyof RegisterFormErrors;
      if (!current[errorKey]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[errorKey];
      return nextErrors;
    });
  };

  const validate = (): RegisterFormErrors => {
    const nextErrors: RegisterFormErrors = {};

    const normalizedFullName = values.fullName.trim();
    const normalizedEmailOrPhone = values.emailOrPhone.trim();

    if (!normalizedFullName) {
      nextErrors.fullName = "Vui lòng nhập họ tên.";
    }

    if (!normalizedEmailOrPhone) {
      nextErrors.emailOrPhone = "Vui lòng nhập email hoặc số điện thoại.";
    } else if (!EMAIL_OR_PHONE_REGEX.test(normalizedEmailOrPhone)) {
      nextErrors.emailOrPhone =
        "Định dạng email hoặc số điện thoại chưa hợp lệ.";
    }

    if (!values.password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (values.password.length < 6) {
      nextErrors.password = "Mật khẩu cần ít nhất 6 ký tự.";
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1500);
      });

      const normalizedFullName = values.fullName.trim();
      const normalizedEmailOrPhone = values.emailOrPhone.trim();

      console.log("Register Success:", {
        fullName: normalizedFullName,
        emailOrPhone: normalizedEmailOrPhone,
        password: values.password,
      });

      setValues({
        fullName: "",
        emailOrPhone: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mx-auto flex w-full max-w-[399px] flex-col gap-[22px]">
        <TextInput
          id="fullName"
          label="Họ tên"
          name="fullName"
          value={values.fullName}
          onChange={handleChange}
          placeholder="Nhập họ tên"
          error={errors.fullName}
        />

        <TextInput
          id="emailOrPhone"
          label="Email hoặc số điện thoại"
          name="emailOrPhone"
          value={values.emailOrPhone}
          onChange={handleChange}
          placeholder="Email hoặc số điện thoại"
          autoComplete="username"
          error={errors.emailOrPhone}
        />

        <TextInput
          id="password"
          label="Mật khẩu"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          placeholder="Mật khẩu"
          autoComplete="new-password"
          error={errors.password}
        />

        <TextInput
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          placeholder="Xác nhận mật khẩu"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />

        <div className="mt-1">
          <Button type="submit" loading={isLoading}>
            Đăng ký
          </Button>
        </div>
      </div>
    </form>
  );
}
