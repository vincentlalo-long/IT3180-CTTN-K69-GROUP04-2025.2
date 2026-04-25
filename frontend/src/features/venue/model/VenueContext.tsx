import { createContext } from "react";

import type { Facility } from "../types/venue.types";

export interface VenueContextValue {
  facilities: Facility[];
  selectedVenueId: string;
  selectedVenue: Facility | null;
  setSelectedVenueId: (venueId: string) => void;
}

export const VenueContext = createContext<VenueContextValue | undefined>(
  undefined,
);
