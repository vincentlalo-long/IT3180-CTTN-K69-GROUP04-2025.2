import type { PitchTypeOption } from "../utils/pitchManagement.utils";

export interface PitchManagementSlotPrice {
  slotLabel: string;
  price: number;
}

export interface PitchManagementFormData {
  selectedArea: string;
  newAreaName?: string;
  newAreaAddress?: string;
  pitchName: string;
  pitchType: PitchTypeOption;
  description: string;
  imageFile?: File | null;
  slotPrices: PitchManagementSlotPrice[];
}

export interface PitchManagementTabProps {
  facilityName?: string;
}
