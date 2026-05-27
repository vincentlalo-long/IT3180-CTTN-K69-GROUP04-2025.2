import {
  PlayerBookingHistory,
  PlayerProfileForm,
  PlayerProfileSidebar,
  PlayerSystemLinks,
  usePlayerProfile,
} from "../../features/account";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";
import { useState, useEffect, useCallback } from "react";
import { getPlayerBookings } from "../../features/account/api/account.api";
import { subscribeProfileEvent } from "../../features/account/hooks/usePlayerProfile";

export function ProfilePage() {
  const { userInfo, loadingUser, userError, refetch } = usePlayerProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchHistory = useCallback(() => {
    setLoadingHistory(true);
    setHistoryError(null);
    getPlayerBookings()
      .then((data) => {
        setHistory(data);
        setLoadingHistory(false);
      })
      .catch((err) => {
        if (!err.response) setHistoryError("Không có kết nối mạng.");
        else if (err.response.status === 401) setHistoryError("Token hết hạn hoặc chưa đăng nhập.");
        else setHistoryError("Lỗi server hoặc không xác định.");
        setLoadingHistory(false);
      });
  }, []);

  // Effect 1: fetch history lần đầu khi mount
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: refetch history khi userInfo thay đổi, bỏ qua lần mount đầu
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }
    if (userInfo) fetchHistory();
  }, [userInfo, fetchHistory, isMounted]);

  // Effect 3: subscribe event emitter để refetch cả profile lẫn history
  useEffect(() => {
    const handler = () => {
      refetch();
      fetchHistory();
    };
    const unsub = subscribeProfileEvent(handler);
    return unsub;
  }, [refetch, fetchHistory]);

  const toggleEditing = () => setIsEditing((prev) => !prev);
  const toggleHistory = () => setShowHistory((prev) => !prev);

  const updateUserInfo = (field: string, value: string) => {
    console.log("updateUserInfo", field, value);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D] flex items-center justify-center">
        <div className="text-white text-lg font-semibold">
          Đang tải thông tin tài khoản...
        </div>
      </div>
    );
  }

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
      <PlayerNavBar />
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="flex flex-col md:flex-row gap-5">
          <PlayerProfileSidebar userInfo={userInfo} />
          <div className="flex-1 rounded-2xl bg-white/90 px-8 py-6">
            <PlayerProfileForm
              userInfo={userInfo}
              isEditing={isEditing}
              onToggleEditing={toggleEditing}
              onChangeName={(value) => updateUserInfo("name", value)}
              onChangePhone={(value) => updateUserInfo("phone", value)}
              onChangeEmail={(value) => updateUserInfo("email", value)}
            />
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
