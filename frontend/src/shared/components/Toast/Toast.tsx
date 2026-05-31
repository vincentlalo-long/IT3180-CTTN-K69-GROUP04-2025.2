import { useToastStore } from "../../utils/toast";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => {
        const bgClass =
          t.type === "success"
            ? "bg-emerald-600/90 border-emerald-500/50 text-emerald-50"
            : t.type === "error"
            ? "bg-rose-600/90 border-rose-500/50 text-rose-50"
            : "bg-cyan-600/90 border-cyan-500/50 text-cyan-50";

        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${bgClass}`}
          >
            <span>{t.message}</span>
            <button className="ml-3 text-white/70 hover:text-white text-xs">✕</button>
          </div>
        );
      })}
    </div>
  );
}
