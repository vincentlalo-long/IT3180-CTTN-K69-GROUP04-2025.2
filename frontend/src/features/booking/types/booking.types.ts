export type SlotStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE";

export interface ScheduleSlotDto {
  timeSlotId: number;
  slotNumber: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  customerName: string | null;
  customerPhone: string | null;
  depositAmount: number | null;
  price: number | null;
}

export interface PitchScheduleDto {
  pitchId: number;
  pitchName: string;
  venueName: string;
  slots: ScheduleSlotDto[];
}

export interface ScheduleSlot {
  status: SlotStatus;
  customerName?: string;
  phone?: string;
  deposit?: string;
  timeSlotId?: number;
  price?: number | null;
}

export interface FieldScheduleRow {
  fieldId: string;
  facilityId: string;
  facilityName: string;
  fieldName: string;
  fieldType: string;
  slots: Record<string, ScheduleSlot>;
}

export type PitchPhysicalStatus = "active" | "maintenance" | "disabled";

export interface CreateBookingRequest {
  pitchId: number;
  bookingDate: string; // YYYY-MM-DD
  timeSlotId: number;
}

export interface PlayerBookingResponse {
  id: number;
  pitchId: number;
  pitchName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: string | number;
  depositAmount: string | number;
  status: string;
}
