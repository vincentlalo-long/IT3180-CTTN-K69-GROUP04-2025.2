import { Check, Pencil } from "lucide-react";
import type { ReactNode } from "react";

import type { PlayerProfileInfo } from "../../types/account.types";

interface PlayerProfileFormProps {
  userInfo: PlayerProfileInfo;
  isEditing: boolean;
  onToggleEditing: () => void;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeEmail: (value: string) => void;
  children?: ReactNode;
}

export function PlayerProfileForm({
  userInfo,
  isEditing,
  onToggleEditing,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  children,
}: PlayerProfileFormProps) {
  return (
    <>
      <div className="mb-5 flex items-center gap-6">
        {isEditing ? (
          <input
            value={userInfo.name}
            onChange={(event) => onChangeName(event.target.value)}
            className="border-b-2 border-[#2E7D1E] bg-transparent text-xl font-bold text-[#2E7D1E] outline-none"
          />
        ) : (
          <span className="text-xl font-bold text-[#2E7D1E]">
            {userInfo.name}
          </span>
        )}
        <button
          onClick={onToggleEditing}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900"
        >
          {isEditing ? (
            <>
              Lưu thay đổi
              <Check size={15} className="text-[#2E7D1E]" />
            </>
          ) : (
            <>
              Chỉnh sửa thông tin cá nhân
              <Pencil size={15} />
            </>
          )}
        </button>
      </div>

      {children}

      <p className="mb-2 text-base font-bold text-[#2E7D1E]">
        Thông tin cá nhân
      </p>
      <div className="mb-5 flex flex-col gap-3">
        <input
          disabled={!isEditing}
          value={userInfo.phone}
          onChange={(event) => onChangePhone(event.target.value)}
          placeholder="Số điện thoại"
          className={`h-11 w-full rounded-xl px-4 text-sm text-gray-700 outline-none transition
                  ${
                    isEditing
                      ? "border-2 border-[#2E7D1E]/50 bg-white focus:border-[#2E7D1E]"
                      : "cursor-default bg-[#D9D9D9]"
                  }`}
        />
        <input
          disabled={!isEditing}
          value={userInfo.email}
          onChange={(event) => onChangeEmail(event.target.value)}
          placeholder="Email"
          className={`h-11 w-full rounded-xl px-4 text-sm text-gray-700 outline-none transition
                  ${
                    isEditing
                      ? "border-2 border-[#2E7D1E]/50 bg-white focus:border-[#2E7D1E]"
                      : "cursor-default bg-[#D9D9D9]"
                  }`}
        />
      </div>
    </>
  );
}
