/**
 * Facility Provider Component
 * Provider wrapper cho Facility Context
 */

import { useMemo, useState, type ReactNode } from "react";

import {
  ALL_FACILITIES_ID,
  facilities,
} from "../data/mockAdminData";
import { FacilityContext, type FacilityContextValue } from "./FacilityContext";

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
