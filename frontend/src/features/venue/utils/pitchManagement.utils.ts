export const pitchTypeOptions = ["5vs5", "7vs7", "11vs11"] as const;

export type PitchTypeOption = (typeof pitchTypeOptions)[number];

export const createAreaOptionValue = "__create_new_area__";
export const defaultSlotPrice = 250000;

export interface AreaOption {
  value: string;
  label: string;
}

const baseAreaOptions: AreaOption[] = [
  { value: "zone-north", label: "Khu sân phía Bắc" },
  { value: "zone-central", label: "Khu sân trung tâm" },
  { value: "zone-south", label: "Khu sân phía Nam" },
  { value: createAreaOptionValue, label: "Tạo khu sân mới..." },
];

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

export function buildAreaDropdownOptions(facilityName?: string): AreaOption[] {
  if (!facilityName?.trim()) {
    return baseAreaOptions;
  }

  const hasFacilityInOptions = baseAreaOptions.some(
    (option) => option.label.toLowerCase() === facilityName.toLowerCase(),
  );

  if (hasFacilityInOptions) {
    return baseAreaOptions;
  }

  return [{ value: "zone-current", label: facilityName }, ...baseAreaOptions];
}