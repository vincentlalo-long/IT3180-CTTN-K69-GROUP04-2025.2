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
    history,
    loadingHistory,
    historyError,
    showHistory,
    toggleEditing,
    toggleHistory,
    updateUserInfo,
  } = usePlayerProfile();

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
