import Linh from "../../assets/images/Linh.jpg";
import {
  PlayerBookingHistory,
  PlayerProfileForm,
  PlayerProfileSidebar,
  PlayerSystemLinks,
  usePlayerProfile,
} from "../../features/account";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";

export function ProfilePage() {
  const {
    isEditing,
    userInfo,
    loadingUser,
    userError,
    history,
    loadingHistory,
    historyError,
    showHistory,
    toggleEditing,
    toggleHistory,
    updateUserInfo,
  } = usePlayerProfile();

  // Nếu chưa load xong user
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D] flex items-center justify-center">
        <div className="text-white text-lg font-semibold">Đang tải thông tin tài khoản...</div>
      </div>
    );
  }

  // Nếu lỗi hoặc chưa đăng nhập
  if (userError || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D] flex items-center justify-center">
        <div className="text-red-500 text-lg font-semibold">
          {userError === "Unauthenticated"
            ? "Bạn cần đăng nhập để xem thông tin tài khoản."
            : userError || "Không thể tải thông tin tài khoản."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      {/* Header */}
      <PlayerNavBar />
      {/* Content */}
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="flex gap-5">
          <PlayerProfileSidebar avatarSrc={Linh} />

          {/* Right column */}
          <div className="flex-1 rounded-2xl bg-white/90 px-8 py-6">
            {/* Form thông tin cá nhân */}
            <PlayerProfileForm
              userInfo={userInfo}
              isEditing={isEditing}
              onToggleEditing={toggleEditing}
              onChangeName={(value) => updateUserInfo("name", value)}
              onChangePhone={(value) => updateUserInfo("phone", value)}
              onChangeEmail={(value) => updateUserInfo("email", value)}
            />

            {/* Lịch sử đặt sân - Đặt ngang hàng với Form */}
            <PlayerBookingHistory
              showHistory={showHistory}
              loadingHistory={loadingHistory}
              historyError={historyError}
              history={history}
              onToggleHistory={toggleHistory}
            />

            <PlayerSystemLinks />
          </div>
        </div>
      </main>
    </div>
  );
}