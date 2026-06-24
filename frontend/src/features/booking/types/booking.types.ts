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
  services?: Array<{
    serviceId: number;
    quantity: number;
  }>;
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

export type RecurrenceType = "WEEKLY" | "MONTHLY";

export type RecurringDayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface RecurringBookingRequest {
  pitchId: number;
  timeSlotId: number;
  startDate: string; // YYYY-MM-DD
  recurrenceType: RecurrenceType;
  daysOfWeek?: RecurringDayOfWeek[];
  numberOfWeeks?: number;
  numberOfMonths?: number;
  dayOfMonth?: number;
  skipConflicts?: boolean;
  services?: Array<{
    serviceId: number;
    quantity: number;
  }>;
}

export interface RecurringBookingSkippedOccurrence {
  bookingDate: string;
  pitchId: number;
  timeSlotId: number;
  reasonCode: string;
  reason: string;
}

export interface RecurringBookingResponse {
  requestedCount: number;
  createdCount: number;
  skippedCount: number;
  totalPrice: string | number;
  totalDepositAmount: string | number;
  bookings: PlayerBookingResponse[];
  skippedOccurrences: RecurringBookingSkippedOccurrence[];
  message: string;
}
