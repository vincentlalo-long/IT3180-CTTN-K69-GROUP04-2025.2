import { Button } from "../../../../shared/components/Button";
import { TextInput } from "../../../../shared/components/Input";
import { useProfileForm } from "../../hooks/useProfileForm";
import { Loader2, Shield, Calendar, Mail, Phone, User as UserIcon } from "lucide-react";

export function ProfileTab() {
  const {
    handleSubmit,
    isSaving,
    isLoading,
    error,
    profileForm,
    adminInfo,
    updateProfileField,
  } = useProfileForm();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#84e30f]" />
        <p className="text-sm font-medium text-white/80">Đang tải hồ sơ quản trị viên...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-sm font-medium text-rose-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Thông tin cá nhân</h3>
        <p className="mt-1 text-sm text-white/75">
          Cập nhật thông tin quản trị viên đang phụ trách vận hành.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Left Column: Admin Identity Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center space-y-4 backdrop-blur-md">
          {/* Large Avatar */}
          <div className="relative h-24 w-24 rounded-full border-4 border-white/15 bg-gradient-to-tr from-[#3BA55D]/30 to-[#84e30f]/30 flex items-center justify-center text-white text-3xl font-extrabold shadow-inner overflow-hidden">
            {adminInfo?.avatarUrl ? (
              <img src={adminInfo.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              profileForm.fullName ? profileForm.fullName.charAt(0).toUpperCase() : "A"
            )}
          </div>

          <div>
            <h4 className="text-base font-bold text-white truncate max-w-[220px]">
              {profileForm.fullName || "Quản trị viên"}
            </h4>
            <p className="text-xs text-white/60 truncate max-w-[220px] mt-0.5">
              {profileForm.email}
            </p>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-[#84e30f]/20 px-3 py-1 text-xs font-bold text-[#84e30f] border border-[#84e30f]/30">
            <Shield size={12} />
            Quản trị viên
          </span>

          <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center space-y-1.5 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-white/40" />
              <span>
                Tham gia:{" "}
                {adminInfo?.createdAt
                  ? new Date(adminInfo.createdAt).toLocaleDateString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="profile-full-name" className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                <UserIcon size={14} /> Họ và tên
              </label>
              <input
                id="profile-full-name"
                type="text"
                value={profileForm.fullName}
                onChange={(event) =>
                  updateProfileField("fullName", event.target.value)
                }
                placeholder="Nhập họ và tên"
                className="w-full h-[50px] px-4 rounded-xl bg-[#0f4d2a] border border-emerald-600/40 text-white placeholder:text-emerald-200/40 focus:bg-[#135832] focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base font-body"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                <Phone size={14} /> Số điện thoại
              </label>
              <input
                id="profile-phone"
                type="text"
                value={profileForm.phone}
                onChange={(event) =>
                  updateProfileField("phone", event.target.value)
                }
                placeholder="Nhập số điện thoại"
                className="w-full h-[50px] px-4 rounded-xl bg-[#0f4d2a] border border-emerald-600/40 text-white placeholder:text-emerald-200/40 focus:bg-[#135832] focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base font-body"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="flex items-center gap-1.5 text-sm font-semibold text-white/50">
                <Mail size={14} /> Địa chỉ Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={profileForm.email}
                disabled
                placeholder="Nhập email"
                className="w-full h-[50px] px-4 rounded-xl bg-[#0f4d2a] border border-emerald-600/40 text-white placeholder:text-emerald-200/40 focus:bg-[#135832] focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base font-body opacity-60 cursor-not-allowed"
              />
              <p className="text-[11px] text-white/40">Email dùng để đăng nhập và không thể thay đổi.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-role" className="flex items-center gap-1.5 text-sm font-semibold text-white/50">
                <Shield size={14} /> Quyền hạn tài khoản
              </label>
              <input
                id="profile-role"
                type="text"
                value={adminInfo?.role || "ADMIN"}
                disabled
                className="w-full h-[50px] px-4 rounded-xl bg-[#0f4d2a] border border-emerald-600/40 text-white placeholder:text-emerald-200/40 focus:bg-[#135832] focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base font-body opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              loading={isSaving}
              className="h-[46px] w-full max-w-[200px] text-sm font-semibold rounded-xl bg-gradient-to-r from-[#3BA55D] to-[#29721D] hover:from-[#43be6b] hover:to-[#318622] text-white border border-white/10 shadow-[0_0_12px_rgba(132,227,15,0.15)]"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
