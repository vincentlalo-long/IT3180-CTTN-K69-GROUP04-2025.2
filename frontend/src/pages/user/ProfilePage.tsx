import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, Calendar, Terminal, Pencil, Check } from "lucide-react";
import logoImage from "../../assets/images/logo-amixi.png";
import Linh from "../../assets/images/Linh.jpg";
import { UserNavbar } from "../../components/user/UserNavbar.tsx";

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState({
    name: "Phạm Gia Linh",
    field1: "",
    field2: "",
  });

  // Booking history state
  const [history, setHistory] = useState<Array<{
    id: string;
    field: string;
    slot: string;
    date: string;
    status: "pending" | "confirmed" | "cancelled";
    price: number;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!showHistory) return;
    setLoadingHistory(true);
    setHistoryError(null);
    fetch("/api/user/bookings")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải lịch sử đặt sân.");
        return res.json();
      })
      .then((data) => setHistory(data))
      .catch((err) => setHistoryError(err.message))
      .finally(() => setLoadingHistory(false));
  }, [showHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      {/* Header */}
      <UserNavbar />
      {/* Content */}
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="flex gap-5">
          {/* Left column */}
          <div className="flex w-[200px] shrink-0 flex-col gap-4">
            <div className="h-[190px] w-full rounded-2xl bg-white/90 overflow-hidden">
              <img src={Linh} alt="avatar" className="h-full w-full object-cover" />
            </div>
            <div className="h-[130px] w-full rounded-2xl bg-white/20" />
          </div>

          {/* Right column */}
          <div className="flex-1 rounded-2xl bg-white/90 px-8 py-6">

            {/* Name + edit toggle */}
            <div className="flex items-center gap-6 mb-5">
              {isEditing ? (
                <input
                  value={info.name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  className="text-xl font-bold text-[#2E7D1E] bg-transparent border-b-2 border-[#2E7D1E] outline-none"
                />
              ) : (
                <span className="text-xl font-bold text-[#2E7D1E]">{info.name}</span>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
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

            {/* Hoạt động */}
            <p className="text-base font-bold text-[#2E7D1E] mb-2">Hoạt động</p>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc] mb-5"
            >
              <Calendar size={17} className="text-gray-500" />
              Lịch sử đặt sân
            </button>
            {showHistory && (
              <div className="mb-5">
                <div className="font-semibold mb-2">Lịch sử đặt sân</div>
                {loadingHistory ? (
                  <div className="text-gray-500 text-sm">Đang tải...</div>
                ) : historyError ? (
                  <div className="text-red-500 text-sm">{historyError}</div>
                ) : history.length === 0 ? (
                  <div className="text-gray-500 text-sm">Chưa có lịch sử đặt sân.</div>
                ) : (
                  <ul className="space-y-3">
                    {history.map((item) => (
                      <li key={item.id} className="rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 bg-white">
                        <div className="flex-1">
                          <div className="font-semibold text-[#2E7D1E]">{item.field}</div>
                          <div className="text-sm text-gray-700">{item.slot} | {item.date}</div>
                          <div className="text-sm text-gray-500">Giá: {item.price.toLocaleString()}₫</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold
                          ${item.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${item.status === "confirmed" ? "bg-green-100 text-green-700" : ""}
                          ${item.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                        `}>
                          {item.status === "pending" && "Chờ xác nhận"}
                          {item.status === "confirmed" && "Đã xác nhận"}
                          {item.status === "cancelled" && "Đã hủy"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Thông tin cá nhân */}
            <p className="text-base font-bold text-[#2E7D1E] mb-2">Thông tin cá nhân</p>
            <div className="flex flex-col gap-3 mb-5">
              <input
                disabled={!isEditing}
                value={info.field1}
                onChange={(e) => setInfo({ ...info, field1: e.target.value })}
                placeholder="Số điện thoại"
                className={`h-11 w-full rounded-xl px-4 text-sm text-gray-700 outline-none transition
                  ${isEditing
                    ? "bg-white border-2 border-[#2E7D1E]/50 focus:border-[#2E7D1E]"
                    : "bg-[#D9D9D9] cursor-default"
                  }`}
              />
              <input
                disabled={!isEditing}
                value={info.field2}
                onChange={(e) => setInfo({ ...info, field2: e.target.value })}
                placeholder="Email"
                className={`h-11 w-full rounded-xl px-4 text-sm text-gray-700 outline-none transition
                  ${isEditing
                    ? "bg-white border-2 border-[#2E7D1E]/50 focus:border-[#2E7D1E]"
                    : "bg-[#D9D9D9] cursor-default"
                  }`}
              />
            </div>

            {/* Hệ thống */}
            <p className="text-base font-bold text-[#2E7D1E] mb-2">Hệ thống</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { /* TODO */ }}
                className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
              >
                <Terminal size={15} className="text-gray-500" />
                Điều khoản và chính sách
              </button>
              <button
                onClick={() => { /* TODO */ }}
                className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
              >
                <Terminal size={15} className="text-gray-500" />
                Report và hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}