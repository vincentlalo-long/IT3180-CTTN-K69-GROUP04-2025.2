import type { SlotStatus } from "../types/booking.types";

export const slotStatusStyles: Record<
  SlotStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Trống",
    className:
      "border border-white/20 bg-white/6 text-white/90 hover:border-white/55",
  },
  booked: {
    label: "Đã cọc",
    className:
      "border border-amber-200/70 bg-amber-300/30 text-amber-50 hover:border-amber-100",
  },
  "in-progress": {
    label: "Đang đá",
    className:
      "border border-lime-100/90 bg-lime-300/45 text-[#103314] hover:border-white",
  },
  maintenance: {
    label: "Bảo trì",
    className:
      "border border-slate-200/45 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_9px,rgba(130,130,130,0.2)_9px,rgba(130,130,130,0.2)_18px)] text-slate-100 hover:border-slate-100/65",
  },
};
