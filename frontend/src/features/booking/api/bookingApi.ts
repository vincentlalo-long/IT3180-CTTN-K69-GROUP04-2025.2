import apiClient from "@/shared/api/apiClient";
import type { SpringPageResponse } from "@/features/venue/api/venueApi";
import { logApiError } from "@/shared/utils/apiError";
import type {
  CreateBookingRequest,
  PlayerBookingResponse,
  RecurringBookingRequest,
  RecurringBookingResponse,
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

export const createRecurringBooking = async (
  payload: RecurringBookingRequest,
): Promise<RecurringBookingResponse> => {
  const response = await apiClient.post<RecurringBookingResponse>(
    "/player/bookings/recurring",
    payload,
  );
  return response.data;
};

// TODO: Player cancel booking
// When the backend exposes an endpoint for players to cancel their own bookings,
// implement this function and wire it into BookingField / BookingPage.
//
// Expected endpoint options:
//   DELETE /player/bookings/{bookingId}
//   PATCH  /player/bookings/{bookingId}/cancel
//
// export const cancelPlayerBooking = async (bookingId: number): Promise<void> => {
//   await apiClient.delete(`/player/bookings/${bookingId}`);
// };

export const cancelUnpaidBooking = async (bookingId: number): Promise<void> => {
  await apiClient.post(`/player/bookings/${bookingId}/cancel-unpaid`);
};

// ==================== ADMIN SETTLEMENT APIs ====================

export interface AdminBookingDetailResponse {
  id: number;
  venueId: number;
  venueName: string;
  pitchName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalPrice: number;
  depositAmount: number;
  paymentStatus: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  addOns: Array<{
    serviceName: string;
    quantity: number;
    price: number;
  }>;
}

export interface VenueServiceItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  status: string;
}

export const fetchBookingDetail = async (
  bookingId: number,
): Promise<AdminBookingDetailResponse> => {
  const response = await apiClient.get<AdminBookingDetailResponse>(
    `/admin/bookings/${bookingId}`,
  );
  return response.data;
};

export const fetchVenueActiveServices = async (
  venueId: number,
): Promise<VenueServiceItem[]> => {
  const response = await apiClient.get<VenueServiceItem[]>(
    `/admin/venues/${venueId}/services`,
  );
  return response.data;
};

/**
 * Lấy danh sách dịch vụ ACTIVE cho modal Chốt hóa đơn.
 * Endpoint này không cần check quyền sở hữu cụm sân.
 */
export const fetchAvailableServicesForBooking = async (
  bookingId: number,
): Promise<VenueServiceItem[]> => {
  const response = await apiClient.get<VenueServiceItem[]>(
    `/admin/bookings/${bookingId}/available-services`,
  );
  return response.data;
};

export interface SettleBookingPayload {
  services: Array<{ serviceId: number; quantity: number }>;
  paymentMethod: string;
  adminNote: string;
}

export const settleBookingApi = async (
  bookingId: number,
  payload: SettleBookingPayload,
): Promise<AdminBookingDetailResponse> => {
  const response = await apiClient.post<AdminBookingDetailResponse>(
    `/admin/bookings/${bookingId}/settle`,
    payload,
  );
  return response.data;
};
