import apiClient from "@/shared/api/apiClient";
import { logApiError } from "@/shared/utils/apiError";
import type {
  ServiceItemResponse,
  VenueAvailabilityResponse,
  VenueResponseDTO,
  AdminVenueResponseDTO,
  PitchDetailResponse,
  CreatePitchReviewRequest,
  PitchReviewResponse,
} from "@/features/venue/types/venue.types";

export interface SpringPageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export interface FieldDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

// ─── Admin Venue APIs ────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả các sân bóng (dành cho Admin)
 */
export const getFields = async (): Promise<FieldDto[]> => {
  try {
    const response = await apiClient.get<SpringPageResponse<FieldDto>>("/admin/venues");
    return response.data.content;
  } catch (error) {
    logApiError("getFields", error);
    throw error;
  }
};

/**
 * Tạo Venue mới (FormData: venue JSON + avatar file)
 */
export const createVenue = async (formData: FormData): Promise<AdminVenueResponseDTO> => {
  try {
    const response = await apiClient.post<AdminVenueResponseDTO>("/admin/venues", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    logApiError("createVenue", error);
    throw error;
  }
};

/**
 * Cập nhật Venue (FormData: venue JSON + optional avatar file)
 */
export const updateVenue = async (venueId: number, formData: FormData): Promise<AdminVenueResponseDTO> => {
  try {
    const response = await apiClient.put<AdminVenueResponseDTO>(`/admin/venues/${venueId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    logApiError("updateVenue", error, { venueId });
    throw error;
  }
};

/**
 * Xóa Venue
 */
export const deleteVenue = async (venueId: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/venues/${venueId}`);
  } catch (error) {
    logApiError("deleteVenue", error, { venueId });
    throw error;
  }
};

// ─── Admin Pitch APIs ────────────────────────────────────────────────

export interface PitchPayload {
  name: string;
  pitchType: string;
  isActive: boolean;
  slotPrices: Array<{
    slotNumber: number;
    weekdayPrice: number;
    weekendPrice: number;
  }>;
}

/**
 * Lấy danh sách sân con theo venue (Admin)
 */
export const fetchPitchesByVenue = async (venueId: number): Promise<PitchDetailResponse[]> => {
  try {
    const response = await apiClient.get<SpringPageResponse<PitchDetailResponse>>(
      `/admin/venues/${venueId}/pitches`,
      { params: { size: 100 } },
    );
    return response.data.content;
  } catch (error) {
    logApiError("fetchPitchesByVenue", error, { venueId });
    throw error;
  }
};

/**
 * Tạo Pitch mới (JSON body)
 */
export const createPitch = async (venueId: number, data: PitchPayload): Promise<PitchDetailResponse> => {
  try {
    const response = await apiClient.post<PitchDetailResponse>(
      `/admin/venues/${venueId}/pitches`,
      data,
    );
    return response.data;
  } catch (error) {
    logApiError("createPitch", error, { venueId });
    throw error;
  }
};

/**
 * Cập nhật Pitch (JSON body)
 */
export const updatePitch = async (pitchId: number, data: PitchPayload): Promise<PitchDetailResponse> => {
  try {
    const response = await apiClient.put<PitchDetailResponse>(
      `/admin/pitches/${pitchId}`,
      data,
    );
    return response.data;
  } catch (error) {
    logApiError("updatePitch", error, { pitchId });
    throw error;
  }
};

/**
 * Xóa Pitch
 */
export const deletePitch = async (pitchId: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/pitches/${pitchId}`);
  } catch (error) {
    logApiError("deletePitch", error, { pitchId });
    throw error;
  }
};

// ─── Player APIs ─────────────────────────────────────────────────────

/**
 * Lấy danh sách các sân bóng đang hoạt động (dành cho Player)
 */
export const getVenues = async (): Promise<VenueResponseDTO[]> => {
  try {
    const response = await apiClient.get<SpringPageResponse<VenueResponseDTO>>("/player/venues");
    return response.data.content;
  } catch (error) {
    logApiError("getVenues", error);
    throw error;
  }
};

/**
 * Lấy danh sách slot theo ngày cho một cụm sân
 */
export const getVenueAvailability = async (
  venueId: number,
  date: string,
): Promise<VenueAvailabilityResponse> => {
  try {
    const response = await apiClient.get<VenueAvailabilityResponse>(
      `/player/venues/${venueId}/availability`,
      { params: { date } },
    );
    return response.data;
  } catch (error) {
    logApiError("getVenueAvailability", error, { venueId, date });
    throw error;
  }
};

export const getVenueServices = async (
  venueId: number,
): Promise<ServiceItemResponse[]> => {
  try {
    const response = await apiClient.get<ServiceItemResponse[]>(
      `/player/venues/${venueId}/services`,
    );
    return response.data;
  } catch (error) {
    logApiError("getVenueServices", error, { venueId });
    throw error;
  }
};

export const createPitchReview = async (
  payload: CreatePitchReviewRequest,
): Promise<PitchReviewResponse> => {
  try {
    const response = await apiClient.post<PitchReviewResponse>("/player/reviews", payload);
    return response.data;
  } catch (error) {
    logApiError("createPitchReview", error, { bookingId: payload.bookingId });
    throw error;
  }
};
