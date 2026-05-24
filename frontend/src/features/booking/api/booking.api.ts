import apiClient from "@/shared/api/apiClient";
import type { PitchScheduleDto } from "../types/booking.types";

export const getAdminFieldSchedules = async (
  venueId: string | number | null,
  date: string
): Promise<PitchScheduleDto[]> => {
  const params: Record<string, string | number> = { date };
  if (venueId && venueId !== "all") {
    params.venueId = venueId;
  }
  
  const response = await apiClient.get<PitchScheduleDto[]>("/admin/bookings/schedules", {
    params,
  });
  
  return response.data;
};
