import type { PlayerBookingHistoryItem } from "../types/account.types";

export const getPlayerBookings = async (): Promise<
  PlayerBookingHistoryItem[]
> => {
  const response = await fetch("/api/user/bookings");

  if (!response.ok) {
    throw new Error("Không thể tải lịch sử đặt sân.");
  }

  return (await response.json()) as PlayerBookingHistoryItem[];
};
