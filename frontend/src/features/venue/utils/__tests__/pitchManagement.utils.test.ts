import {
  formatMinutes,
  generateTimeSlots,
  pitchTypeToBackend,
  pitchTypeFromBackend,
  pitchTypeDisplayLabel,
} from "../pitchManagement.utils";

describe("formatMinutes", () => {
  it("formats minutes to HH:MM", () => {
    expect(formatMinutes(390)).toBe("06:30");
  });

  it("formats midnight", () => {
    expect(formatMinutes(0)).toBe("00:00");
  });

  it("formats exactly one hour", () => {
    expect(formatMinutes(60)).toBe("01:00");
  });

  it("formats with leading zeros", () => {
    expect(formatMinutes(540)).toBe("09:00");
  });

  it("formats with minutes component", () => {
    expect(formatMinutes(690)).toBe("11:30");
  });
});

describe("generateTimeSlots", () => {
  it("generates slots from 06:30 to 23:00 with 90min intervals", () => {
    const slots = generateTimeSlots();
    expect(slots).toEqual([
      "06:30-08:00",
      "08:00-09:30",
      "09:30-11:00",
      "11:00-12:30",
      "12:30-14:00",
      "14:00-15:30",
      "15:30-17:00",
      "17:00-18:30",
      "18:30-20:00",
      "20:00-21:30",
      "21:30-23:00",
    ]);
  });

  it("returns 11 time slots", () => {
    expect(generateTimeSlots()).toHaveLength(11);
  });

  it("first slot starts at 06:30", () => {
    const slots = generateTimeSlots();
    expect(slots[0]).toMatch(/^06:30/);
  });

  it("last slot ends at 23:00", () => {
    const slots = generateTimeSlots();
    expect(slots[slots.length - 1]).toMatch(/-23:00$/);
  });
});

describe("pitchTypeToBackend", () => {
  it('maps "5vs5" to "SAN_5"', () => {
    expect(pitchTypeToBackend("5vs5")).toBe("SAN_5");
  });

  it('maps "7vs7" to "SAN_7"', () => {
    expect(pitchTypeToBackend("7vs7")).toBe("SAN_7");
  });

  it('maps "11vs11" to "SAN_11"', () => {
    expect(pitchTypeToBackend("11vs11")).toBe("SAN_11");
  });
});

describe("pitchTypeFromBackend", () => {
  it('maps "SAN_5" to "5vs5"', () => {
    expect(pitchTypeFromBackend("SAN_5")).toBe("5vs5");
  });

  it('maps "SAN_7" to "7vs7"', () => {
    expect(pitchTypeFromBackend("SAN_7")).toBe("7vs7");
  });

  it('maps "SAN_11" to "11vs11"', () => {
    expect(pitchTypeFromBackend("SAN_11")).toBe("11vs11");
  });

  it('defaults to "7vs7" for null', () => {
    expect(pitchTypeFromBackend(null)).toBe("7vs7");
  });

  it('defaults to "7vs7" for undefined', () => {
    expect(pitchTypeFromBackend(undefined)).toBe("7vs7");
  });

  it('defaults to "7vs7" for unknown value', () => {
    expect(pitchTypeFromBackend("UNKNOWN")).toBe("7vs7");
  });
});

describe("pitchTypeDisplayLabel", () => {
  it('maps "SAN_5" to "5 vs 5"', () => {
    expect(pitchTypeDisplayLabel("SAN_5")).toBe("5 vs 5");
  });

  it('maps "SAN_7" to "7 vs 7"', () => {
    expect(pitchTypeDisplayLabel("SAN_7")).toBe("7 vs 7");
  });

  it('maps "SAN_11" to "11 vs 11"', () => {
    expect(pitchTypeDisplayLabel("SAN_11")).toBe("11 vs 11");
  });

  it('defaults to "7 vs 7" for null', () => {
    expect(pitchTypeDisplayLabel(null)).toBe("7 vs 7");
  });

  it('defaults to "7 vs 7" for undefined', () => {
    expect(pitchTypeDisplayLabel(undefined)).toBe("7 vs 7");
  });
});
