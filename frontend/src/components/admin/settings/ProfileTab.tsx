import { type FormEvent, useState } from "react";

import { Button } from "../../ui/Button";
import { TextInput } from "../../ui/TextInput";

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
}

const defaultProfileForm: ProfileFormData = {
  fullName: "Admin MIXIFOOT",
  email: "admin@mixifoot.vn",
  phone: "0988 888 888",
};

export function ProfileTab() {
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] =
    useState<ProfileFormData>(defaultProfileForm);

  const updateProfileField = <Key extends keyof ProfileFormData>(
    key: Key,
    value: ProfileFormData[Key],
  ) => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 700);
    });

    setIsSaving(false);
  };

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
