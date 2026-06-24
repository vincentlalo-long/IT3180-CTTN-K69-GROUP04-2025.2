interface FilterBarProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

const PRESETS = [
  { id: "TODAY", label: "Hôm nay" },
  { id: "WEEK", label: "Tuần này" },
  { id: "MONTH", label: "Tháng này" },
  { id: "CUSTOM", label: "Tùy chỉnh" },
];

export function FilterBar({
  timeRange,
  setTimeRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-white/60">Bộ lọc thời gian:</span>
        <div className="inline-flex rounded-xl bg-black/20 p-1 border border-white/5">
          {PRESETS.map((preset) => {
            const isActive = timeRange === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTimeRange(preset.id)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#005E2E] text-white shadow-sm"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {timeRange === "CUSTOM" && (
        <div className="flex flex-wrap items-center gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white outline-none transition focus:border-[#005E2E]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white outline-none transition focus:border-[#005E2E]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
