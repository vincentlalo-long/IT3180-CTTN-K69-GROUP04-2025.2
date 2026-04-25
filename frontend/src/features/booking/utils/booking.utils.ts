import type { AdminTimeSlot } from "../../../data/mockAdminData";
import type { Order } from "../types";

const HOURS_24 = 24 * 60 * 60 * 1000;

export const formatMoney = (amount: number): string =>
  `${amount.toLocaleString("vi-VN")}đ`;

export const addMinutes = (time: string, minutes: number): string => {
  const [hoursPart, minutesPart] = time
    .split(":")
    .map((value) => Number(value));
  const totalMinutes = hoursPart * 60 + minutesPart + minutes;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const mins = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
};

export const getRangeLabel = (startTime: AdminTimeSlot): string =>
  `${startTime} - ${addMinutes(startTime, 90)}`;

export const formatCompactPrice = (amount: number): string =>
  `${Math.round(amount / 1_000).toLocaleString("vi-VN")}k`;

export const getStatusClass = (status: Order["status"]): string => {
  if (status === "Chờ cọc") {
    return "border border-amber-100/75 bg-amber-300/30 text-amber-50";
  }

  if (status === "Đã cọc") {
    return "border border-lime-100/85 bg-lime-300/45 text-[#123915]";
  }

  return "border border-rose-100/80 bg-rose-400/35 text-rose-50";
};

export const canCancelOrder = (matchDate: string): boolean => {
  const diff = new Date(matchDate).getTime() - Date.now();
  return diff > HOURS_24;
};
