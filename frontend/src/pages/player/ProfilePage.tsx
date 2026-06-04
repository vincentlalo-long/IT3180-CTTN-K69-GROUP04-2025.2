import {
  PlayerBookingHistory,
  PlayerProfileForm,
  PlayerProfileSidebar,
  usePlayerProfile,
} from "../../features/account";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPlayerBookings, updatePlayerProfile } from "../../features/account/api/account.api";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import { toast } from "../../shared/utils/toast";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../features/auth/hooks/useAuthContext";
import { saveTokenToStorage, getUserFromStorage } from "@/shared/utils/tokenStorage";

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { checkAuth } = useAuthContext();
  const { userInfo, loadingUser, userError } = usePlayerProfile();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "history" | "terms">("profile");

  // Sync activeTab when navigating via router state
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab as "profile" | "history" | "terms");
    }
  }, [location.state]);

  // Smooth scroll window to top on activeTab change (important on mobile viewports)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const [editData, setEditData] = useState({ username: "", phoneNumber: "", email: "" });

  useEffect(() => {
    if (userInfo) {
      setEditData({
        username: userInfo.username,
        phoneNumber: userInfo.phoneNumber || "",
        email: userInfo.email,
      });
    }
  }, [userInfo]);

  // React Query for booking history
  const {
    data: history = [],
    isLoading: loadingHistory,
    error: historyQueryError,
  } = useQuery({
    queryKey: ["playerBookings"],
    queryFn: getPlayerBookings,
    staleTime: 2 * 60 * 1000,
  });

  const historyError = historyQueryError
    ? getApiErrorMessage(historyQueryError, "Không thể tải lịch sử đặt sân.")
    : null;

  // React Query Mutation for profile updates
  const updateProfileMutation = useMutation({
    mutationFn: () => updatePlayerProfile(editData.username, editData.phoneNumber),
    onSuccess: () => {
      // Invalidate query to refetch latest profile details
      void queryClient.invalidateQueries({ queryKey: ["playerProfile"] });
      
      // Update local storage and context state
      const storedUser = getUserFromStorage();
      if (storedUser) {
        saveTokenToStorage(storedUser.token || "", {
          ...storedUser,
          username: editData.username,
        });
      }
      checkAuth();

      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    },
    onError: (err) => {
      logApiError("ProfilePage.updateProfile", err);
      toast.error(getApiErrorMessage(err, "Lỗi khi cập nhật thông tin!"));
    },
  });

  const toggleEditing = async () => {
    if (isEditing) {
      updateProfileMutation.mutate();
    } else {
      setIsEditing(true);
    }
  };

  const updateUserInfo = (field: keyof typeof editData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {loadingUser ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-lg font-semibold animate-pulse">
              Đang tải thông tin tài khoản...
            </div>
          </div>
        ) : userError || !userInfo ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500 text-lg font-semibold bg-white/10 px-6 py-4 rounded-xl border border-white/20">
              {userError === "Unauthenticated"
                ? "Bạn cần đăng nhập để xem thông tin tài khoản."
                : userError || "Không thể tải thông tin tài khoản."}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-5">
            <PlayerProfileSidebar
              userInfo={userInfo}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              bookingsCount={history.length}
            />
            <div className="flex-1 rounded-2xl bg-white px-8 py-6 shadow-sm">
              {activeTab === "profile" && (
                <>
                  <PlayerProfileForm
                    userInfo={isEditing ? { ...userInfo, ...editData } : userInfo}
                    isEditing={isEditing}
                    onToggleEditing={toggleEditing}
                    onChangeName={(value) => updateUserInfo("username", value)}
                    onChangePhone={(value) => updateUserInfo("phoneNumber", value)}
                    onChangeEmail={(value) => updateUserInfo("email", value)}
                  />
                  {updateProfileMutation.isPending && (
                    <div className="flex items-center text-sm text-[#2E7D1E] font-medium mb-4">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu thay đổi...
                    </div>
                  )}
                </>
              )}

              {activeTab === "history" && (
                <PlayerBookingHistory
                  showHistory={true}
                  loadingHistory={loadingHistory}
                  historyError={historyError}
                  history={history}
                  onToggleHistory={() => { }}
                  isTab={true}
                />
              )}

              {activeTab === "terms" && (
                <div className="bg-white p-2 rounded-xl max-h-[650px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-4 mb-5">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#2E7D1E]">
                        Điều khoản & Chính sách
                      </h2>
                      <p className="text-xs text-gray-500">
                        Quy định sử dụng dịch vụ đặt sân trực tuyến MIXIFOOT
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      Quay lại hồ sơ
                    </button>
                  </div>

                  <div className="prose prose-sm max-w-none text-slate-700 space-y-5 leading-relaxed">
                    <section>
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        1. Quy định đặt sân trực tuyến
                      </h3>
                      <p className="text-sm">
                        Người dùng có thể tìm kiếm cụm sân, xem khung giờ trống và tiến hành đặt sân trực tuyến. Thông tin đặt sân phải chính xác, bao gồm họ tên, số điện thoại liên lạc của người nhận sân.
                      </p>
                      <p className="text-sm mt-1">
                        Each successful field reservation will receive a confirmation email. Users are responsible for arriving at the field on time.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        2. Chính sách đặt cọc và thanh toán
                      </h3>
                      <p className="text-sm">
                        Để bảo đảm quyền lợi và tránh trường hợp đặt sân ảo, hệ thống yêu cầu thanh toán đặt cọc từ 30% đến 50% tổng giá trị đơn đặt sân tùy theo quy định của từng chủ cụm sân.
                      </p>
                      <p className="text-sm mt-1">
                        Phần tiền còn lại sẽ được thanh toán trực tiếp tại quầy của cụm sân sau khi kết thúc buổi đá bóng hoặc thanh toán online toàn bộ tùy vào sự lựa chọn của quý khách.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        3. Chính sách hoàn tiền và hủy lịch đặt sân
                      </h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-sm">
                        <li>
                          <strong>Hủy lịch trước 24 giờ:</strong> Quý khách được hoàn trả 100% số tiền đã đặt cọc hoặc được hỗ trợ chuyển khung giờ đặt sân hoàn toàn miễn phí.
                        </li>
                        <li>
                          <strong>Hủy lịch từ 12 giờ đến 24 giờ:</strong> Hệ thống hỗ trợ hoàn trả 50% tiền cọc hoặc cấn trừ sang buổi đặt sau.
                        </li>
                        <li>
                          <strong>Hủy lịch dưới 12 giờ:</strong> Quý khách không được hoàn trả tiền đặt cọc dưới mọi hình thức vì chủ sân đã chuẩn bị và giữ chỗ cho trận đấu của bạn.
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        4. Trách nhiệm của người chơi
                      </h3>
                      <p className="text-sm">
                        Người chơi cần tuân thủ nghiêm ngặt nội quy của ban quản lý sân bóng, giữ gìn vệ sinh chung, không mang chất cấm hay vũ khí vào khu vực thi đấu.
                      </p>
                      <p className="text-sm mt-1">
                        Mọi hành vi gây rối trật tự công cộng, phá hoại cơ sở vật chất của sân bóng sẽ bị xử lý nghiêm theo quy định pháp luật và tài khoản sẽ bị khóa vĩnh viễn trên hệ thống MIXIFOOT.
                      </p>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}