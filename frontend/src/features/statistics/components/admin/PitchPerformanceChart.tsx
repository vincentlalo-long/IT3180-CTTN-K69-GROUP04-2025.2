import { useState } from "react";

import type { PitchPerformanceDto } from "../../types/statistics.types";
import { formatCurrency } from "../../utils/statistics.utils";

interface PitchPerformanceChartProps {
  pitchPerformances: PitchPerformanceDto[];
  isLoading: boolean;
}

type MetricType = "bookings" | "revenue";

export function PitchPerformanceChart({
  pitchPerformances,
  isLoading,
}: PitchPerformanceChartProps) {
  const [metric, setMetric] = useState<MetricType>("bookings");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-72 w-full animate-pulse flex-col justify-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="h-6 w-48 rounded bg-white/10" />
        <div className="mt-8 flex h-full items-end gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-full rounded-t-xl bg-white/10"
              style={{ height: `${20 + index * 15}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!pitchPerformances || pitchPerformances.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm text-white/50">
        Không có dữ liệu hiệu suất sân bóng trong khoảng thời gian này
      </div>
    );
  }

  // Get max value for calculations
  const maxVal = Math.max(
    ...pitchPerformances.map((item) =>
      metric === "bookings" ? item.bookingCount : item.revenue,
    ),
    1, // Avoid division by zero
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-white text-base">Hiệu suất sân bóng</h3>
          <p className="text-xs text-white/50">
            {metric === "bookings"
              ? "So sánh số lượt đặt sân"
              : "So sánh doanh thu các sân"}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-black/20 p-1 border border-white/5 self-start">
          <button
            type="button"
            onClick={() => setMetric("bookings")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              metric === "bookings"
                ? "bg-[#005E2E] text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Lượt đặt
          </button>
          <button
            type="button"
            onClick={() => setMetric("revenue")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              metric === "revenue"
                ? "bg-[#005E2E] text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Doanh thu
          </button>
        </div>
      </div>

      {/* Chart Layout */}
      <div className="relative mt-8 flex h-52 items-end gap-3 sm:gap-6 border-b border-white/10 pb-2 px-2">
        {pitchPerformances.map((item, index) => {
          const value = metric === "bookings" ? item.bookingCount : item.revenue;
          const percentage = (value / maxVal) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.pitchId}
              className="group relative flex h-full w-full flex-col justify-end items-center cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 z-10 rounded-lg bg-zinc-900 border border-white/10 px-3 py-1 text-center shadow-lg animate-fadeIn">
                  <p className="text-[10px] font-medium text-white/50">
                    {item.pitchName}
                  </p>
                  <p className="text-xs font-bold text-white">
                    {metric === "bookings"
                      ? `${item.bookingCount} lượt đặt`
                      : formatCurrency(item.revenue)}
                  </p>
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-[#005E2E]/40 to-[#005E2E] transition-all duration-300 group-hover:from-[#005E2E]/60 group-hover:to-emerald-400 group-hover:scale-x-105 shadow-[0_0_15px_rgba(0,94,46,0.2)]"
                style={{ height: `${Math.max(percentage, 6)}%` }}
              />

              {/* Label */}
              <span className="absolute -bottom-7 text-[10px] font-semibold text-white/60 group-hover:text-white truncate max-w-full">
                {item.pitchName}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" /> {/* Spacer for X-axis labels */}
    </div>
  );
}
