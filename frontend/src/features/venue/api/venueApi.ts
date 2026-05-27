import apiClient from "@/shared/api/apiClient";
import { logApiError } from "@/shared/utils/apiError";
import type {
  VenueAvailabilityResponse,
  VenueResponseDTO,
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
