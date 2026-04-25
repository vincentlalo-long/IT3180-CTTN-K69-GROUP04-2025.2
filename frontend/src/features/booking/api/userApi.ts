export interface BookedSlot {
  court: string;
  slot: string;
}

export interface BookSlotsPayload {
  date: string;
  slots: BookedSlot[];
}

export interface BookSlotsResponse {
  success: boolean;
  message?: string;
}

const STORAGE_KEY_PREFIX = "mixifoot-booked-slots:";

const getStorageKey = (date: string): string => `${STORAGE_KEY_PREFIX}${date}`;

const isBookedSlot = (value: unknown): value is BookedSlot => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { court?: unknown; slot?: unknown };
  return (
    typeof candidate.court === "string" && typeof candidate.slot === "string"
  );
};

const readBookedSlots = (date: string): BookedSlot[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(getStorageKey(date));
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isBookedSlot);
  } catch {
    return [];
  }
};

const writeBookedSlots = (date: string, slots: BookedSlot[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(date), JSON.stringify(slots));
};

export const getBookedSlots = async (date: string): Promise<BookedSlot[]> => {
  return readBookedSlots(date);
};

export const bookSlots = async (
  payload: BookSlotsPayload,
): Promise<BookSlotsResponse> => {
  const existingSlots = readBookedSlots(payload.date);
  const existingSet = new Set(
    existingSlots.map((item) => `${item.court}|${item.slot}`),
  );

  const mergedSlots = [...existingSlots];
  payload.slots.forEach((slot) => {
    const key = `${slot.court}|${slot.slot}`;
    if (!existingSet.has(key)) {
      existingSet.add(key);
      mergedSlots.push(slot);
    }
  });

  writeBookedSlots(payload.date, mergedSlots);

  return { success: true };
};
