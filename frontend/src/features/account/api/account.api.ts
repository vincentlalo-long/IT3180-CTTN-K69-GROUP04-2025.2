import type { PlayerBookingHistoryItem } from "../types/account.types";
import apiClient from "@/shared/api/apiClient";

export const getPlayerBookings = async (): Promise<PlayerBookingHistoryItem[]> => {
  const response = await apiClient.get("/user/bookings");
  return response.data as PlayerBookingHistoryItem[];
};