import apiClient from "@/shared/api/apiClient";

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
