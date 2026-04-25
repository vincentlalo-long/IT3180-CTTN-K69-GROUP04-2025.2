import { useMemo, useState, type ReactNode } from "react";

import { ALL_FACILITIES_ID, facilities } from "../../../data/mockAdminData";
import { VenueContext, type VenueContextValue } from "./VenueContext";

interface VenueProviderProps {
  children: ReactNode;
}

export function VenueProvider({ children }: VenueProviderProps) {
  const [selectedVenueId, setSelectedVenueId] =
    useState<string>(ALL_FACILITIES_ID);

  const value = useMemo<VenueContextValue>(() => {
    const selectedVenue =
      selectedVenueId === ALL_FACILITIES_ID
        ? null
        : (facilities.find((facility) => facility.id === selectedVenueId) ??
          null);

    return {
      facilities,
      selectedVenueId,
      selectedVenue,
      setSelectedVenueId,
    };
  }, [selectedVenueId]);

  return (
    <VenueContext.Provider value={value}>{children}</VenueContext.Provider>
  );
}
