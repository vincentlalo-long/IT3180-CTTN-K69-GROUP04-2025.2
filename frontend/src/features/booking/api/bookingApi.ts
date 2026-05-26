import apiClient from "@/shared/api/apiClient";
import type {
  CreateBookingRequest,
  PlayerBookingResponse,
} from "@/features/booking/types/booking.types";

export const createBooking = async (
  payload: CreateBookingRequest,
): Promise<PlayerBookingResponse> => {
  const response = await apiClient.post<PlayerBookingResponse>(
    "/player/bookings",
    payload,
  );
  return response.data;
};

