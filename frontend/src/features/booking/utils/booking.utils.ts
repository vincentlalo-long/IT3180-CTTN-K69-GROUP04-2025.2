import type { AdminTimeSlot } from "../constants/booking.constants";

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

export const formatCompactPrice = (amount: number | null | undefined): string =>
  `${Math.round((amount || 0) / 1_000).toLocaleString("vi-VN")}k`;
