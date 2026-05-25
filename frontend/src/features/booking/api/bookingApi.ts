import apiClient from "@/shared/api/apiClient";
import type { SpringPageResponse } from "../../venue/api/venueApi";

export interface AdminBookingSummaryResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  venueName: string;
  pitchName: string;
  bookingDate: string;   // "2026-04-18"
  startTime: string;     // "17:00:00"
  endTime: string;       // "18:30:00"
  totalPrice: number;
  depositAmount: number;
  status: string;        // "RESERVED" | "BOOKED" | "PLAYING" | "COMPLETED" | "CANCELLED"
}

/**
 * Lấy danh sách đơn đặt sân (admin), lọc theo venueId nếu có.
 * Backend trả về Page<AdminBookingSummaryResponse>.
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
    console.error("Error fetching orders:", error);
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
