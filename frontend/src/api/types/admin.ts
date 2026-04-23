export interface DashboardStatsResponse {
  totalRevenue: number;
  totalBookings: number;
  uniqueCustomers: number;
  vacancyRate: string | number;
  activeFields: number;
}

export interface RecentOrderDto {
  id: string | number;
  customerName: string;
  fieldName: string;
  bookingTime: string;
  price: number;
  status: string;
}
