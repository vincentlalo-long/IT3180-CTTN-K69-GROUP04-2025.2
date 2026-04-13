import { create } from "zustand";
import {
  ALL_FACILITIES_ID,
  facilities as mockFacilities,
} from "../data/mockAdminData";
import type { Facility } from "../types/facility";

// 1. CẬP NHẬT BẢN THIẾT KẾ ĐẦY ĐỦ
interface FacilityState {
  facilities: Facility[];
  selectedFacilityId: string;
  selectedFacility: Facility | null;
  setSelectedFacilityId: (id: string) => void;
}

// 2. KHỞI TẠO STORE
export const useFacilityStore = create<FacilityState>((set) => ({
  // Dữ liệu ban đầu
  facilities: mockFacilities,
  selectedFacilityId: ALL_FACILITIES_ID,
  selectedFacility: null, // Mặc định là 'ALL' thì không có sân cụ thể nào

  // Hàm thay đổi ID và tự động tìm luôn Object Sân bóng tương ứng
  setSelectedFacilityId: (id: string) =>
    set(() => {
      const facility =
        id === ALL_FACILITIES_ID
          ? null
          : mockFacilities.find((f) => f.id === id) || null;

      return {
        selectedFacilityId: id,
        selectedFacility: facility,
      };
    }),
}));
