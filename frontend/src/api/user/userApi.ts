/**
 * User API Service
 * Tập trung xử lý tất cả API calls liên quan đến user (booking, slots, ...)
 */

import axios from "axios";
import { axiosInstance } from "../axiosInstance";

const USER_API_PREFIX = "/user";

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData;
    }

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim().length > 0
    ) {
      return responseData.message;
    }

    return error.message;
  }

  return error instanceof Error ? error.message : "Lỗi kết nối";
}

// --- Types ---

export interface BookedSlot {
  court: string;
  slot: string;
}

export interface BookSlotsRequest {
  date: string;
  slots: BookedSlot[];
}

export interface BookSlotsResponse {
  success: boolean;
  message?: string;
}

// --- APIs ---

/**
 * Lấy danh sách slot đã được đặt theo ngày
 * GET /user/fields/slots?date=dd/mm/yyyy
 * Response: { bookedSlots: [{ court: "Sân 1", slot: "8:00 - 9:30" }, ...] }
 */
export async function getBookedSlots(date: string): Promise<BookedSlot[]> {
  try {
    const response = await axiosInstance.get<{ bookedSlots: BookedSlot[] }>(
      `${USER_API_PREFIX}/fields/slots`,
      {
        params: { date },
      }
    );
    return response.data.bookedSlots ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Đặt sân
 * POST /user/bookings
 * Body: { date: "dd/mm/yyyy", slots: [{ court: "Sân 1", slot: "8:00 - 9:30" }] }
 * Response: { success: true, message: "..." }
 */
export async function bookSlots(data: BookSlotsRequest): Promise<BookSlotsResponse> {
  try {
    const response = await axiosInstance.post<BookSlotsResponse>(
      `${USER_API_PREFIX}/bookings`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}