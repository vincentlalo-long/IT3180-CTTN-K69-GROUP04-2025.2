// Type alias for monetary values that can come from backend as strings or numbers
export type BigDecimal = string | number;

// Player DTOs
export interface VenueResponseDTO {
  id: number;
  name: string;
  address: string;
  imageUrl: string;
}

export interface VenueSummaryResponse {
  id: number;
  name: string;
  address: string;
  openTime: string; // LocalTime as ISO string or time string (e.g., "08:00")
  closeTime: string; // LocalTime as ISO string or time string (e.g., "22:00")
  minPrice: BigDecimal | number;
}

export interface VenueDetailResponse {
  id: number;
  name: string;
  address: string;
  description: string;
  openTime: string; // LocalTime
  closeTime: string; // LocalTime
}

// Admin DTOs
export interface AdminVenueResponseDTO {
  id: number;
  name: string;
  address: string;
  imageUrl: string;
  revenue: BigDecimal | number;
  totalPitches: number;
}

export interface PitchDetailResponse {
  id: number;
  name: string;
  pitchType: "5" | "7" | "11";
  isActive: boolean;
  venueId: number;
  venueName: string;
  basePrice: BigDecimal | number;
  slotPrices: SlotPriceResponse[];
}

export interface SlotPriceResponse {
  slotNumber: number;
  weekdayPrice: BigDecimal | number;
  weekendPrice: BigDecimal | number;
}

// Mock/UI types (backward compatible)
export interface Facility {
  id: string;
  apiFacilityId: string;
  name: string;
  address: string;
}

export interface VenueItem {
  id: number;
  imageUrl?: string;
  ballLogoUrl?: string;
  name: string;
  address: string;
  openTime: string;
}
