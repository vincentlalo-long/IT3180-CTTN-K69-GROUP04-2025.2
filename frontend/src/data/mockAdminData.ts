export const ALL_FACILITIES_ID = "all";

export type BookingStatus = "booked" | "in-progress" | "maintenance";
export type FieldType = "Sân 5" | "Sân 7" | "Sân 11";
export type SlotPriceTier = "off-peak" | "transition" | "golden";

export interface Facility {
  id: string;
  name: string;
  address: string;
}

export interface Field {
  id: string;
  facilityId: string;
  name: string;
  type: FieldType;
}

export interface Booking {
  id: string;
  facilityId: string;
  fieldId: string;
  startTime: AdminTimeSlot;
  status: BookingStatus;
  customerName?: string;
  customerPhone?: string;
  depositAmount?: number;
}

export interface Order {
  id: string;
  facilityId: string;
  fieldId: string;
  customerName: string;
  shift: string;
  totalPrice: number;
  depositAmount: number;
  status: "Chờ cọc" | "Đã cọc" | "Đã hủy";
  matchDate: string;
}

export const ADMIN_TIME_SLOTS = [
  "06:30",
  "08:00",
  "09:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "20:00",
  "21:30",
] as const;

export type AdminTimeSlot = (typeof ADMIN_TIME_SLOTS)[number];

export interface TimeSlotPricing {
  tier: SlotPriceTier;
  price: number;
  tierLabel: string;
}

export const TIME_SLOT_PRICING: Record<AdminTimeSlot, TimeSlotPricing> = {
  "06:30": { tier: "off-peak", price: 300_000, tierLabel: "Thấp điểm" },
  "08:00": { tier: "off-peak", price: 300_000, tierLabel: "Thấp điểm" },
  "09:30": { tier: "off-peak", price: 300_000, tierLabel: "Thấp điểm" },
  "11:00": { tier: "off-peak", price: 300_000, tierLabel: "Thấp điểm" },
  "12:30": { tier: "off-peak", price: 300_000, tierLabel: "Thấp điểm" },
  "14:00": { tier: "off-peak", price: 300_000, tierLabel: "Thấp điểm" },
  "15:30": { tier: "transition", price: 450_000, tierLabel: "Chuyển giao" },
  "17:00": { tier: "golden", price: 600_000, tierLabel: "Giờ Vàng" },
  "18:30": { tier: "golden", price: 600_000, tierLabel: "Giờ Vàng" },
  "20:00": { tier: "golden", price: 600_000, tierLabel: "Giờ Vàng" },
  "21:30": { tier: "golden", price: 600_000, tierLabel: "Giờ Vàng" },
};

export const facilities: Facility[] = [
  {
    id: "den-lu-3",
    name: "Khu sân Đền Lừ 3",
    address: "Hoàng Mai, Hà Nội",
  },
  {
    id: "dam-hong",
    name: "Khu sân Đầm Hồng",
    address: "Khương Đình, Hà Nội",
  },
  {
    id: "dai-tu",
    name: "Khu sân Đại Từ",
    address: "Đại Kim, Hà Nội",
  },
];

export const fields: Field[] = [
  { id: "f-001", facilityId: "den-lu-3", name: "Sân 1", type: "Sân 5" },
  { id: "f-002", facilityId: "den-lu-3", name: "Sân 2", type: "Sân 5" },
  { id: "f-003", facilityId: "den-lu-3", name: "Sân 3", type: "Sân 7" },
  { id: "f-004", facilityId: "dam-hong", name: "Sân 1", type: "Sân 5" },
  { id: "f-005", facilityId: "dam-hong", name: "Sân 2", type: "Sân 7" },
  { id: "f-006", facilityId: "dam-hong", name: "Sân 3", type: "Sân 7" },
  { id: "f-007", facilityId: "dai-tu", name: "Sân 1", type: "Sân 5" },
  { id: "f-008", facilityId: "dai-tu", name: "Sân 2", type: "Sân 5" },
  { id: "f-009", facilityId: "dai-tu", name: "Sân 3", type: "Sân 11" },
];

export const mockBookings: Booking[] = [
  {
    id: "bk-001",
    facilityId: "den-lu-3",
    fieldId: "f-001",
    startTime: "17:00",
    status: "booked",
    customerName: "Khải Nguyễn",
    customerPhone: "0987 654 321",
    depositAmount: 600_000,
  },
  {
    id: "bk-002",
    facilityId: "den-lu-3",
    fieldId: "f-001",
    startTime: "18:30",
    status: "in-progress",
    customerName: "Tuấn Lê",
    customerPhone: "0912 223 889",
    depositAmount: 600_000,
  },
  {
    id: "bk-003",
    facilityId: "den-lu-3",
    fieldId: "f-002",
    startTime: "15:30",
    status: "booked",
    customerName: "Linh Trần",
    customerPhone: "0935 114 778",
    depositAmount: 450_000,
  },
  {
    id: "bk-004",
    facilityId: "den-lu-3",
    fieldId: "f-003",
    startTime: "20:00",
    status: "maintenance",
  },
  {
    id: "bk-005",
    facilityId: "dam-hong",
    fieldId: "f-004",
    startTime: "14:00",
    status: "booked",
    customerName: "Hải Đăng",
    customerPhone: "0966 418 226",
    depositAmount: 300_000,
  },
  {
    id: "bk-006",
    facilityId: "dam-hong",
    fieldId: "f-004",
    startTime: "21:30",
    status: "booked",
    customerName: "An Phạm",
    customerPhone: "0971 336 901",
    depositAmount: 600_000,
  },
  {
    id: "bk-007",
    facilityId: "dam-hong",
    fieldId: "f-005",
    startTime: "17:00",
    status: "in-progress",
    customerName: "Quang Hoàng",
    customerPhone: "0943 225 160",
    depositAmount: 600_000,
  },
  {
    id: "bk-008",
    facilityId: "dam-hong",
    fieldId: "f-006",
    startTime: "06:30",
    status: "maintenance",
  },
  {
    id: "bk-009",
    facilityId: "dai-tu",
    fieldId: "f-007",
    startTime: "08:00",
    status: "booked",
    customerName: "Thu Hà",
    customerPhone: "0967 315 804",
    depositAmount: 300_000,
  },
  {
    id: "bk-010",
    facilityId: "dai-tu",
    fieldId: "f-008",
    startTime: "17:00",
    status: "booked",
    customerName: "Minh Vũ",
    customerPhone: "0908 552 114",
    depositAmount: 600_000,
  },
  {
    id: "bk-011",
    facilityId: "dai-tu",
    fieldId: "f-008",
    startTime: "20:00",
    status: "in-progress",
    customerName: "Nam Bùi",
    customerPhone: "0979 451 228",
    depositAmount: 600_000,
  },
  {
    id: "bk-012",
    facilityId: "dai-tu",
    fieldId: "f-009",
    startTime: "11:00",
    status: "booked",
    customerName: "Phúc Trần",
    customerPhone: "0981 607 945",
    depositAmount: 300_000,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ord-001",
    facilityId: "den-lu-3",
    fieldId: "f-001",
    customerName: "Khải Nguyễn",
    shift: "Ca 1 (17:30 - 19:00, 18/04/2026)",
    totalPrice: 1_800_000,
    depositAmount: 900_000,
    status: "Chờ cọc",
    matchDate: "2026-04-18T17:30:00",
  },
  {
    id: "ord-002",
    facilityId: "den-lu-3",
    fieldId: "f-002",
    customerName: "Linh Trần",
    shift: "Ca 2 (19:00 - 20:30, 19/04/2026)",
    totalPrice: 1_350_000,
    depositAmount: 675_000,
    status: "Đã cọc",
    matchDate: "2026-04-19T19:00:00",
  },
  {
    id: "ord-003",
    facilityId: "dam-hong",
    fieldId: "f-004",
    customerName: "Hải Đăng",
    shift: "Ca 1 (16:30 - 18:00, 12/04/2026)",
    totalPrice: 900_000,
    depositAmount: 450_000,
    status: "Chờ cọc",
    matchDate: "2026-04-12T16:30:00",
  },
  {
    id: "ord-004",
    facilityId: "dam-hong",
    fieldId: "f-005",
    customerName: "Quang Hoàng",
    shift: "Ca 3 (20:30 - 22:00, 20/04/2026)",
    totalPrice: 1_800_000,
    depositAmount: 900_000,
    status: "Đã cọc",
    matchDate: "2026-04-20T20:30:00",
  },
  {
    id: "ord-005",
    facilityId: "dai-tu",
    fieldId: "f-008",
    customerName: "Minh Vũ",
    shift: "Ca 2 (18:00 - 19:30, 17/04/2026)",
    totalPrice: 1_800_000,
    depositAmount: 900_000,
    status: "Đã hủy",
    matchDate: "2026-04-17T18:00:00",
  },
  {
    id: "ord-006",
    facilityId: "dai-tu",
    fieldId: "f-009",
    customerName: "Phúc Trần",
    shift: "Ca 1 (15:30 - 17:00, 21/04/2026)",
    totalPrice: 900_000,
    depositAmount: 450_000,
    status: "Chờ cọc",
    matchDate: "2026-04-21T15:30:00",
  },
];
