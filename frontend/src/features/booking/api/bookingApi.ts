import apiClient from "@/shared/api/apiClient";
import type { SpringPageResponse } from "@/features/venue/api/venueApi";
import { logApiError } from "@/shared/utils/apiError";
import type {
  CreateBookingRequest,
  PlayerBookingResponse,
} from "@/features/booking/types/booking.types";

export interface AdminBookingSummaryResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  venueName: string;
  pitchName: string;
  bookingDate: string; // "2026-04-18"
  startTime: string; // "17:00:00"
  endTime: string; // "18:30:00"
  totalPrice: number;
  depositAmount: number;
  status: string; // "RESERVED" | "BOOKED" | "PLAYING" | "COMPLETED" | "CANCELLED"
}

/**
 * Lay danh sach don dat san (admin), loc theo venueId neu co.
 * Backend tra ve Page<AdminBookingSummaryResponse>.
 */
export const fetchOrdersByVenue = async (
  venueId: string,
): Promise<AdminBookingSummaryResponse[]> => {
  try {
    const params: Record<string, string> = { size: "200" };
    if (venueId !== "all") {
      params.venueId = venueId;
    }
    const response = await apiClient.get<
      SpringPageResponse<AdminBookingSummaryResponse>
    >("/admin/bookings", { params });
    return response.data.content;
  } catch (error) {
    logApiError("fetchOrdersByVenue", error, { venueId });
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn đặt sân.
 */
export const updateOrderStatusApi = async (
  orderId: number,
  status: string,
  adminNote: string,
): Promise<void> => {
  await apiClient.patch(`/admin/bookings/${orderId}/status`, {
    status,
    adminNote,
  });
};

export const createBooking = async (
  payload: CreateBookingRequest,
): Promise<PlayerBookingResponse> => {
  const response = await apiClient.post<PlayerBookingResponse>(
    "/player/bookings",
    payload,
  );
  return response.data;
};
