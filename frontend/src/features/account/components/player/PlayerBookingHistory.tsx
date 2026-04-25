import { Calendar } from "lucide-react";

import type { PlayerBookingHistoryItem } from "../../types/account.types";

interface PlayerBookingHistoryProps {
  showHistory: boolean;
  loadingHistory: boolean;
  historyError: string | null;
  history: PlayerBookingHistoryItem[];
  onToggleHistory: () => void;
}

export function PlayerBookingHistory({
  showHistory,
  loadingHistory,
  historyError,
  history,
  onToggleHistory,
}: PlayerBookingHistoryProps) {
  return (
    <>
      <p className="mb-2 text-base font-bold text-[#2E7D1E]">Hoạt động</p>
      <button
        onClick={onToggleHistory}
        className="mb-5 flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
      >
        <Calendar size={17} className="text-gray-500" />
        Lịch sử đặt sân
      </button>
      {showHistory && (
        <div className="mb-5">
          <div className="mb-2 font-semibold">Lịch sử đặt sân</div>
          {loadingHistory ? (
            <div className="text-sm text-gray-500">Đang tải...</div>
          ) : historyError ? (
            <div className="text-sm text-red-500">{historyError}</div>
          ) : history.length === 0 ? (
            <div className="text-sm text-gray-500">
              Chưa có lịch sử đặt sân.
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-[#2E7D1E]">
                      {item.field}
                    </div>
                    <div className="text-sm text-gray-700">
                      {item.slot} | {item.date}
                    </div>
                    <div className="text-sm text-gray-500">
                      Giá: {item.price.toLocaleString()}₫
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold
                          ${item.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${item.status === "confirmed" ? "bg-green-100 text-green-700" : ""}
                          ${item.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                        `}
                  >
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
    </>
  );
}
