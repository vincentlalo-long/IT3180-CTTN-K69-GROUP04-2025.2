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
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#2E7D1E]">
            Hồ sơ cá nhân
          </h2>
          <p className="text-xs text-gray-500">
            Quản lý thông tin bảo mật và cấu hình tài khoản
          </p>
        </div>
        <button
          onClick={onToggleEditing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
        >
          {isEditing ? (
            <>
              Lưu thay đổi
              <Check size={16} className="text-[#2E7D1E]" />
            </>
          ) : (
            <>
              Chỉnh sửa thông tin
              <Pencil size={14} />
            </>
          )}
        </button>
      </div>

      {children}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Họ và tên
          </label>
          {isEditing ? (
            <input
              value={userInfo.username}
              onChange={(event) => onChangeName(event.target.value)}
              className="w-full h-11 rounded-xl border border-[#2E7D1E]/40 bg-slate-50/50 px-4 text-sm text-gray-700 outline-none transition focus:border-[#2E7D1E] focus:ring-1 focus:ring-[#2E7D1E]"
            />
          ) : (
            <div className="flex h-11 w-full items-center rounded-xl bg-slate-50 px-4 text-sm font-semibold text-gray-800 border border-slate-100/85">
              {userInfo.username || <span className="text-gray-400 italic">Chưa cập nhật</span>}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Số điện thoại
          </label>
          {isEditing ? (
            <input
              value={userInfo.phoneNumber || ""}
              onChange={(event) => onChangePhone(event.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full h-11 rounded-xl border border-[#2E7D1E]/40 bg-slate-50/50 px-4 text-sm text-gray-700 outline-none transition focus:border-[#2E7D1E] focus:ring-1 focus:ring-[#2E7D1E]"
            />
          ) : (
            <div className="flex h-11 w-full items-center rounded-xl bg-slate-50 px-4 text-sm text-gray-800 border border-slate-100/85">
              {userInfo.phoneNumber ? (
                <span className="font-semibold">{userInfo.phoneNumber}</span>
              ) : (
                <span className="text-gray-400 italic">Chưa cập nhật</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Địa chỉ email
          </label>
          {isEditing ? (
            <input
              value={userInfo.email}
              onChange={(event) => onChangeEmail(event.target.value)}
              className="w-full h-11 rounded-xl border border-[#2E7D1E]/40 bg-slate-50/50 px-4 text-sm text-gray-700 outline-none transition focus:border-[#2E7D1E] focus:ring-1 focus:ring-[#2E7D1E]"
            />
          ) : (
            <div className="flex h-11 w-full items-center rounded-xl bg-slate-50 px-4 text-sm text-gray-800 border border-slate-100/85">
              {userInfo.email ? (
                <span className="font-semibold">{userInfo.email}</span>
              ) : (
                <span className="text-gray-400 italic">Chưa cập nhật</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Vai trò hệ thống
          </label>
          <div className="flex h-11 w-full items-center rounded-xl bg-slate-50 px-4 text-sm text-gray-800 border border-slate-100/85">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 uppercase">
              {userInfo.role || "PLAYER"}
            </span>
          </div>
        </div>

        {userInfo.createdAt && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Ngày tham gia
            </label>
            <div className="flex h-11 w-full items-center rounded-xl bg-slate-50 px-4 text-sm text-gray-800 border border-slate-100/85">
              <span className="font-medium text-gray-600">
                {new Date(userInfo.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}