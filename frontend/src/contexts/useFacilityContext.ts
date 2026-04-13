import { useContext } from "react";
import { FacilityContext } from "./FacilityContext";

export function useFacilityContext() {
  const contextValue = useContext(FacilityContext);

  if (!contextValue) {
    throw new Error("useFacilityContext must be used within FacilityProvider");
  }

  return contextValue;
}
