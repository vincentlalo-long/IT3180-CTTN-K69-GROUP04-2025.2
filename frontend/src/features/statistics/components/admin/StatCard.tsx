import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

export type TrendDirection = "up" | "down";

export interface StatCardTrend {
  value: string;
  direction: TrendDirection;
}

export interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: StatCardTrend;
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  const isPositive = trend.direction === "up";

  return (
    <article className="rounded-2xl border border-white/15 bg-[#005E2E]/45 p-5 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] transition hover:-translate-y-0.5 hover:bg-[#005E2E]/58">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>

        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#005E2E]/60 text-lime-100">
          <Icon size={20} />
        </div>
      </div>

      <div
        className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          isPositive ? "bg-white/16 text-white" : "bg-black/20 text-white"
        }`}
      >
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{trend.value}</span>
      </div>
    </article>
  );
}
