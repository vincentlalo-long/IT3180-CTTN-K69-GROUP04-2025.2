export function VenueSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm w-full animate-pulse">
      <div className="h-[160px] w-full bg-slate-200" />
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0 -mt-8 border-2 border-white shadow-sm" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
