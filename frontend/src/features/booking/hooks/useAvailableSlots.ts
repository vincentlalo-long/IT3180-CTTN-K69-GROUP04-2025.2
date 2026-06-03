import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { getVenueAvailability } from "@/features/venue/api/venueApi";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import type {
  PitchAvailabilityResponse,
  SlotStatusResponse,
  VenueAvailabilityResponse,
} from "@/features/venue/types/venue.types";

interface UseAvailableSlotsResult {
  loading: boolean;
  error: string | null;
  venueAvailability: VenueAvailabilityResponse | null;
  pitch: PitchAvailabilityResponse | null;
  slots: SlotStatusResponse[];
  refresh: () => void;
  lastUpdated: Date | null;
}

interface UseAvailableSlotsOptions {
  refreshIntervalMs?: number;
  autoRefresh?: boolean;
}

export function useAvailableSlots(
  venueId: number,
  pitchId: number,
  selectedDate: Date,
  options: UseAvailableSlotsOptions = {},
): UseAvailableSlotsResult {
  const { refreshIntervalMs, autoRefresh = false } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] =
    useState<VenueAvailabilityResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dateParam = format(selectedDate, "yyyy-MM-dd");
      const data = await getVenueAvailability(venueId, dateParam);
      setAvailability(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tải khung giờ."));
    } finally {
      setLoading(false);
    }
  }, [venueId, selectedDate]);

  useEffect(() => {
    if (!venueId || !selectedDate) return;
    fetchAvailability();
  }, [fetchAvailability, venueId, selectedDate]);

  useEffect(() => {
    if (!autoRefresh || !refreshIntervalMs) return;
    if (!venueId || !selectedDate) return;

    const intervalId = window.setInterval(() => {
      fetchAvailability();
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoRefresh, refreshIntervalMs, fetchAvailability, venueId, selectedDate]);

  const pitch = useMemo(() => {
    return availability?.pitches.find((item) => item.pitchId === pitchId) ?? null;
  }, [availability, pitchId]);

  const slots = pitch?.slots ?? [];

  return {
    loading,
    error,
    venueAvailability: availability,
    pitch,
    slots,
    refresh: fetchAvailability,
    lastUpdated,
  };
}

