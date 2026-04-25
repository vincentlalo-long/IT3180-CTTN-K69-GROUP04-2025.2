import { Button } from "../../../../shared/components/Button";
import { TextInput } from "../../../../shared/components/Input";

import { useProfileForm } from "../../hooks/useProfileForm";

export function ProfileTab() {
  const { handleSubmit, isSaving, profileForm, updateProfileField } =
    useProfileForm();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Thông tin cá nhân</h3>
        <p className="mt-1 text-sm text-white/75">
          Cập nhật thông tin quản trị viên đang phụ trách vận hành.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            id="profile-full-name"
            label="Họ và tên"
            value={profileForm.fullName}
            onChange={(event) =>
              updateProfileField("fullName", event.target.value)
            }
            placeholder="Nhập họ và tên"
            className="text-base"
          />
          <TextInput
            id="profile-phone"
            label="Số điện thoại"
            value={profileForm.phone}
            onChange={(event) =>
              updateProfileField("phone", event.target.value)
            }
            placeholder="Nhập số điện thoại"
            className="text-base"
          />
        </div>

        <TextInput
          id="profile-email"
          label="Email"
          type="email"
          value={profileForm.email}
          onChange={(event) => updateProfileField("email", event.target.value)}
          placeholder="Nhập email"
          className="text-base"
        />

        <Button
          type="submit"
          loading={isSaving}
          className="h-[52px] w-full max-w-[260px] text-base"
        >
          Lưu thay đổi
        </Button>
      </form>
    </div>
  );
}
