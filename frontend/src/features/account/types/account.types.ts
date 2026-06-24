export interface PlayerBookingHistoryItem {
  id: number;
  pitchId: number;
  pitchName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  depositAmount: number;
  status: string;
  reviewed?: boolean;
}

export interface PlayerProfileInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  teamId: number | null;
  membershipPoints: number;
  walletBalance: number;
  createdAt: string;
}
