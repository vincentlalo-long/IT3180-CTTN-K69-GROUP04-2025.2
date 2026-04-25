import type { AdminTimeSlot, BookingStatus } from "../../../data/mockAdminData";

export type SlotStatus = BookingStatus | "available";

export interface ScheduleSlot {
  status: SlotStatus;
  customerName?: string;
  phone?: string;
  deposit?: string;
}

export interface FieldScheduleRow {
  fieldId: string;
  facilityId: string;
  facilityName: string;
  fieldName: string;
  fieldType: string;
  slots: Record<AdminTimeSlot, ScheduleSlot>;
}

export type PitchPhysicalStatus = "active" | "maintenance" | "disabled";
