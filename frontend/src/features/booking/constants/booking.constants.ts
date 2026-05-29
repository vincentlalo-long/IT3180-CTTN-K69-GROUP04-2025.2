import type { SlotStatus } from "../types/booking.types";

export { ALL_FACILITIES_ID } from "../../venue/model/VenueContext";

export const slotStatusStyles: Record<
  SlotStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Trống",
    className:
      "border border-white/20 bg-white/6 text-white/90 hover:border-white/55",
  },
  BOOKED: {
    label: "Đã cọc",
    className:
      "border border-amber-200/70 bg-amber-300/30 text-amber-50 hover:border-amber-100",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    className:
      "border border-slate-200/45 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_9px,rgba(130,130,130,0.2)_9px,rgba(130,130,130,0.2)_18px)] text-slate-100 hover:border-slate-100/65",
  },
};

export const ADMIN_TIME_SLOTS = [
  "06:30",
  "08:00",
  "09:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "20:00",
  "21:30",
] as const;

export type AdminTimeSlot = (typeof ADMIN_TIME_SLOTS)[number];

export type SlotPriceTier = "off-peak" | "transition" | "golden";

export interface TimeSlotPricing {
  tier: SlotPriceTier;
  price: number;
  tierLabel: string;
}

export const TIME_SLOT_PRICING: Record<string, TimeSlotPricing> = {
  "06:30": { tier: "off-peak", price: 300000, tierLabel: "Thấp điểm" },
  "08:00": { tier: "off-peak", price: 300000, tierLabel: "Thấp điểm" },
  "09:30": { tier: "off-peak", price: 300000, tierLabel: "Thấp điểm" },
  "11:00": { tier: "off-peak", price: 300000, tierLabel: "Thấp điểm" },
  "12:30": { tier: "off-peak", price: 300000, tierLabel: "Thấp điểm" },
  "14:00": { tier: "off-peak", price: 300000, tierLabel: "Thấp điểm" },
  "15:30": { tier: "transition", price: 450000, tierLabel: "Chuyển giao" },
  "17:00": { tier: "golden", price: 600000, tierLabel: "Giờ Vàng" },
  "18:30": { tier: "golden", price: 600000, tierLabel: "Giờ Vàng" },
  "20:00": { tier: "golden", price: 600000, tierLabel: "Giờ Vàng" },
  "21:30": { tier: "golden", price: 600000, tierLabel: "Giờ Vàng" },
};

