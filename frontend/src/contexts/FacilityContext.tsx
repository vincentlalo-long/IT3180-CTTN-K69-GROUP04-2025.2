import { createContext, useMemo, useState, type ReactNode } from "react";

import {
  ALL_FACILITIES_ID,
  facilities,
  type Facility,
} from "../data/mockAdminData";

interface FacilityContextValue {
  facilities: Facility[];
  selectedFacilityId: string;
  selectedFacility: Facility | null;
  setSelectedFacilityId: (facilityId: string) => void;
}

export const FacilityContext = createContext<FacilityContextValue | undefined>(
  undefined,
);

interface FacilityProviderProps {
  children: ReactNode;
}

export function FacilityProvider({ children }: FacilityProviderProps) {
  const [selectedFacilityId, setSelectedFacilityId] =
    useState<string>(ALL_FACILITIES_ID);

  const value = useMemo<FacilityContextValue>(() => {
    const selectedFacility =
      selectedFacilityId === ALL_FACILITIES_ID
        ? null
        : (facilities.find((facility) => facility.id === selectedFacilityId) ??
          null);

    return {
      facilities,
      selectedFacilityId,
      selectedFacility,
      setSelectedFacilityId,
    };
  }, [selectedFacilityId]);

  return (
    <FacilityContext.Provider value={value}>
      {children}
    </FacilityContext.Provider>
  );
}
