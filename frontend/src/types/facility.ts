export interface Facility {
  id: string;
  name: string;
  address: string;
}

export interface FacilityContextValue {
  facilities: Facility[];
  selectedFacilityId: string;
  selectedFacility: Facility | null;
  setSelectedFacilityId: (facilityId: string) => void;
}
