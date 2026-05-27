import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  ALL_FACILITIES_ID,
  VenueContext,
  type VenueContextValue,
} from "./VenueContext";
import { getFields } from "../api/venueApi";
import type { Facility } from "../types/venue.types";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface VenueProviderProps {
  children: ReactNode;
}

export function VenueProvider({ children }: VenueProviderProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedVenueId, setSelectedVenueId] =
    useState<string>(ALL_FACILITIES_ID);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [facilityError, setFacilityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoadingFacilities(true);
      setFacilityError(null);
      try {
        const fields = await getFields();
        const formattedFacilities: Facility[] = fields.map((field) => ({
          id: String(field.id),
          apiFacilityId: String(field.id),
          name: field.name,
          address: field.address || "",
        }));
        setFacilities(formattedFacilities);

        // Auto-select first facility if available and no facility is selected
        if (
          formattedFacilities.length > 0 &&
          selectedVenueId === ALL_FACILITIES_ID
        ) {
          setSelectedVenueId(formattedFacilities[0].id);
        }
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Khong the tai danh sach khu san.",
        );
        setFacilities([]);
        setFacilityError(message);
      } finally {
        setIsLoadingFacilities(false);
      }
    };

    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      isLoadingFacilities,
      facilityError,
    };
  }, [facilities, facilityError, isLoadingFacilities, selectedVenueId]);

  return (
    <VenueContext.Provider value={value}>{children}</VenueContext.Provider>
  );
}
