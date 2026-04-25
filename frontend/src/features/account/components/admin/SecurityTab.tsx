import { Button } from "../../../../shared/components/Button";
import { TextInput } from "../../../../shared/components/Input";

import { useSecurityForm } from "../../hooks/useSecurityForm";

export function SecurityTab() {
  const { formError, handleSubmit, isSaving, securityForm, updateField } =
    useSecurityForm();

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
