import { useCallback, useEffect, useMemo, useState } from "react";
import type { TimeSlotRange } from "@/features/venue/types/venue.types";

const isSameSlot = (left: TimeSlotRange, right: TimeSlotRange) =>
  left.startTime === right.startTime && left.endTime === right.endTime;

interface UseSlotSelectionOptions {
  resetKey?: Array<string | number | boolean | Date | undefined | null>;
}

export function useSlotSelection(options: UseSlotSelectionOptions = {}) {
  const { resetKey = [] } = options;
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotRange[]>([]);
  const resetKeySignature = useMemo(() => JSON.stringify(resetKey), [resetKey]);

  // Reset selection when dependencies change (date, pitch, etc.)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSlots([]);
  }, [resetKeySignature]);

  const toggleSlot = useCallback((slot: TimeSlotRange) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((item) => isSameSlot(item, slot));
      if (exists) {
        return prev.filter((item) => !isSameSlot(item, slot));
      }
      return [...prev, slot];
    });
  }, []);

  const clearSlots = useCallback(() => {
    setSelectedSlots([]);
  }, []);

  return {
    selectedSlots,
    toggleSlot,
    clearSlots,
    setSelectedSlots,
  };
}
