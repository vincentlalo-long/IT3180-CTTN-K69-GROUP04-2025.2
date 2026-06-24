import type { PlayerBookingHistoryItem } from "../types/account.types";
import apiClient from "@/shared/api/apiClient";

export const getPlayerBookings = async (): Promise<PlayerBookingHistoryItem[]> => {
  const response = await apiClient.get("/player/bookings?size=100");
  return response.data.content as PlayerBookingHistoryItem[];
};

export const updatePlayerProfile = async (
  username: string,
  phoneNumber: string
): Promise<void> => {
  await apiClient.patch("/users/me", { username, phoneNumber });
};

export const topUpWallet = async (amount: number): Promise<number> => {
  const response = await apiClient.post<{ walletBalance: number }>(
    "/wallet/top-up",
    { amount },
  );
  return response.data.walletBalance;
};
