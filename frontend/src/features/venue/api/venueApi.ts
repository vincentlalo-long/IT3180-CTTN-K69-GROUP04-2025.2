import apiClient from "@/shared/api/apiClient";
import type { VenueAvailabilityResponse } from "@/features/venue/types/venue.types";

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
 * Lấy danh sách tất cả các sân bóng
 */
export const getFields = async (): Promise<FieldDto[]> => {
  try {
    const response = await apiClient.get<SpringPageResponse<FieldDto>>("/admin/venues");
    return response.data.content;
  } catch (error) {
    console.error("Error fetching fields:", error);
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
    console.error("Error fetching venue availability:", error);
    throw error;
  }
};
