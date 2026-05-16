import { useState, useEffect, useReducer } from "react";
import apiClient from "@/shared/api/apiClient";

export interface SlotStatus {
  slotNumber: number;
  startTime: string;
  endTime: string;
  price: number;
  status: "BOOKED" | "AVAILABLE";
}

type FetchAction =
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

type FetchState = { loading: boolean; error: string | null };

const fetchReducer = (_state: FetchState, action: FetchAction): FetchState => {
  switch (action.type) {
    case "loading": return { loading: true, error: null };
    case "success": return { loading: false, error: null };
    case "error":   return { loading: false, error: action.message };
    default:        return { loading: false, error: null };
  }
};

export function usePitchSlots(pitchId: number | string, selectedDate: string) {
  const [slots, setSlots] = useState<SlotStatus[]>([]);
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!pitchId || !selectedDate) return;

    let cancelled = false;
    dispatch({ type: "loading" });

    apiClient
      .get(`/player/venues/${pitchId}/availability`, {
        params: { date: selectedDate },
      })
      .then((res) => {
        if (cancelled) return;
        setSlots(res.data.slots || []);
        dispatch({ type: "success" });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Không thể tải slot sân bóng";
        dispatch({ type: "error", message });
        setSlots([]);
      });

    return () => {
      cancelled = true;
    };
  }, [pitchId, selectedDate]);

  return { slots, loading: fetchState.loading, error: fetchState.error };
}