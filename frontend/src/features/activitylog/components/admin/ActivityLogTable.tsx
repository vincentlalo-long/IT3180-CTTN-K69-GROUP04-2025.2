import { useActivityLogs } from "../../hooks/useActivityLogs";

function getActionBadgeClass(actionType: string) {
  const normalized = actionType.toUpperCase();
  if (normalized.includes("CREATE") || normalized.includes("CONFIRM")) {
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
  if (normalized.includes("CANCEL") || normalized.includes("DELETE") || normalized.includes("BAN")) {
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  }
  if (normalized.includes("UPDATE") || normalized.includes("EDIT")) {
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }
  return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
}

export function ActivityLogTable() {
  const {
    logs,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
  } = useActivityLogs(0, 10);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
        Đã xảy ra lỗi: {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-base">Nhật ký hoạt động hệ thống</h3>
          <p className="text-xs text-white/50">Lịch sử tác vụ của quản trị viên và hệ thống</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs text-white/70">
          <thead>
            <tr className="border-b border-white/10 text-white/55 font-semibold">
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Người thực hiện</th>
              <th className="py-3 px-4">Hành động</th>
              <th className="py-3 px-4">Đối tượng</th>
              <th className="py-3 px-4">Mô tả chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-white/5 animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-3 w-28 rounded bg-white/10" /></td>
                  <td className="py-3.5 px-4"><div className="h-3 w-20 rounded bg-white/10" /></td>
                  <td className="py-3.5 px-4"><div className="h-5 w-16 rounded-full bg-white/10" /></td>
                  <td className="py-3.5 px-4"><div className="h-3 w-16 rounded bg-white/10" /></td>
                  <td className="py-3.5 px-4"><div className="h-3 w-56 rounded bg-white/10" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/40">
                  Không có bản ghi nhật ký hoạt động nào.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const formattedTime = new Date(log.createdAt).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                return (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 hover:bg-white/5 transition duration-150"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-white/50">
                      {formattedTime}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white/90">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getActionBadgeClass(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] border border-white/5 font-mono text-white/60">
                        {log.targetType} #{log.targetId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/80 max-w-xs truncate" title={log.description || ""}>
                      {log.description}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs">
          <span className="text-white/50">
            Trang {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-white/10 bg-black/25 px-3 py-1.5 font-semibold text-white/75 transition hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Trang trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-white/10 bg-black/25 px-3 py-1.5 font-semibold text-white/75 transition hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
