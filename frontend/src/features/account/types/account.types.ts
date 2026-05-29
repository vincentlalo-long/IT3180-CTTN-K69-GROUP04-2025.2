export interface PlayerBookingHistoryItem {
  id: string;
  field: string;
  slot: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled";
  price: number;
}

export interface PlayerProfileInfo {
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string; // Thêm dòng này
  role?: string;      // Thêm dòng này
}