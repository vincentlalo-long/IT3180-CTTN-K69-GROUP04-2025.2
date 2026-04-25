import { useContext } from "react";

import { VenueContext } from "../model/VenueContext";

export function useVenueContext() {
  const contextValue = useContext(VenueContext);

  if (!contextValue) {
    throw new Error("useVenueContext must be used within VenueProvider");
  }

  return contextValue;
}
