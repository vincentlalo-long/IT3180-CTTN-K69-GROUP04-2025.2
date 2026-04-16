import { createContext } from "react";

import { type Facility } from "../data/mockAdminData";

export interface FacilityContextValue {
  facilities: Facility[];
  selectedFacilityId: string;
  selectedFacility: Facility | null;
  setSelectedFacilityId: (facilityId: string) => void;
}

export const FacilityContext = createContext<FacilityContextValue | undefined>(
  undefined,
);
