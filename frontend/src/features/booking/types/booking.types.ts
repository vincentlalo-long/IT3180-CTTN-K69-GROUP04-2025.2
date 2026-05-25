export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';

export interface ScheduleSlotDto {
  timeSlotId: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  customerName: string | null;
  customerPhone: string | null;
  depositAmount: number | null;
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
