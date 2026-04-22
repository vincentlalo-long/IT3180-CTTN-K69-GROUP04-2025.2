import { type FormEvent, useState } from "react";

import { Button } from "../../ui/Button";
import { TextInput } from "../../ui/TextInput";

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultSecurityForm: SecurityFormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function SecurityTab() {
  const [securityForm, setSecurityForm] =
    useState<SecurityFormData>(defaultSecurityForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const updateField = <Key extends keyof SecurityFormData>(
    key: Key,
    value: SecurityFormData[Key],
  ) => {
    setSecurityForm((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setFormError("Mật khẩu mới và xác nhận mật khẩu chưa khớp.");
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setFormError("Mật khẩu mới cần ít nhất 8 ký tự.");
      return;
    }

    setFormError(null);
    setIsSaving(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 700);
    });

    setIsSaving(false);
    setSecurityForm(defaultSecurityForm);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Bảo mật</h3>
        <p className="mt-1 text-sm text-white/75">
          Đổi mật khẩu và cập nhật thông tin đăng nhập quản trị.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="security-current-password"
          label="Mật khẩu cũ"
          type="password"
          value={securityForm.currentPassword}
          onChange={(event) =>
            updateField("currentPassword", event.target.value)
          }
          placeholder="Nhập mật khẩu cũ"
          className="text-base"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            id="security-new-password"
            label="Mật khẩu mới"
            type="password"
            value={securityForm.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
            placeholder="Nhập mật khẩu mới"
            className="text-base"
          />
          <TextInput
            id="security-confirm-password"
            label="Xác nhận mật khẩu"
            type="password"
            value={securityForm.confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
            placeholder="Nhập lại mật khẩu mới"
            className="text-base"
          />
        </div>

        {formError ? (
          <p className="text-sm font-medium text-red-300">{formError}</p>
        ) : null}

        <Button
          type="submit"
          loading={isSaving}
          className="h-[52px] w-full max-w-[260px] text-base"
        >
          Cập nhật mật khẩu
        </Button>
      </form>
    </div>
  );
}
