import type { PitchTypeOption } from "../utils/pitchManagement.utils";

export interface PitchManagementSlotPrice {
  slotLabel: string;
  weekdayPrice: number;
  weekendPrice: number;
}

export interface PitchManagementFormData {
  pitchName: string;
  pitchType: PitchTypeOption;
  slotPrices: PitchManagementSlotPrice[];
}

export interface VenueFormData {
  venueName: string;
  venueAddress: string;
  venueDescription?: string;
  imageFile?: File | null;
}

export interface PitchManagementTabProps {
  facilityName?: string;
}
