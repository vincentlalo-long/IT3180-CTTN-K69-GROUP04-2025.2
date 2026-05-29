export const pitchTypeOptions = ["5vs5", "7vs7", "11vs11"] as const;

export type PitchTypeOption = (typeof pitchTypeOptions)[number];

export const defaultSlotPrice = 250000;

export function formatMinutes(minutes: number): string {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");

  return `${hour}:${minute}`;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const startMinutes = 6 * 60 + 30;
  const endMinutes = 23 * 60;
  const slotDuration = 90;

  for (
    let currentStart = startMinutes;
    currentStart + slotDuration <= endMinutes;
    currentStart += slotDuration
  ) {
    const currentEnd = currentStart + slotDuration;
    slots.push(`${formatMinutes(currentStart)}-${formatMinutes(currentEnd)}`);
  }

  return slots;
}

export const timeSlots = generateTimeSlots();

// ─── PitchType mapping: Frontend ↔ Backend ──────────────────────────

/**
 * Map frontend label → backend enum value cho khi gửi API
 * "5vs5" → "SAN_5", "7vs7" → "SAN_7", "11vs11" → "SAN_11"
 */
export function pitchTypeToBackend(frontendType: PitchTypeOption): string {
  switch (frontendType) {
    case "5vs5":
      return "SAN_5";
    case "7vs7":
      return "SAN_7";
    case "11vs11":
      return "SAN_11";
    default:
      return "SAN_7";
  }
}

/**
 * Map backend enum value → frontend label cho khi nhận API response
 * "SAN_5" → "5vs5", "SAN_7" → "7vs7", "SAN_11" → "11vs11"
 */
export function pitchTypeFromBackend(backendType: string | null | undefined): PitchTypeOption {
  switch (backendType) {
    case "SAN_5":
      return "5vs5";
    case "SAN_11":
      return "11vs11";
    case "SAN_7":
    default:
      return "7vs7";
  }
}

/**
 * Map backend pitchType → label hiển thị trên UI
 * "SAN_5" → "5 vs 5"
 */
export function pitchTypeDisplayLabel(backendType: string | null | undefined): string {
  switch (backendType) {
    case "SAN_5":
      return "5 vs 5";
    case "SAN_11":
      return "11 vs 11";
    case "SAN_7":
    default:
      return "7 vs 7";
  }
}