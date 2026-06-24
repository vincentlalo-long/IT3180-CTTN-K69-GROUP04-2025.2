import { formatMoney, addMinutes, getRangeLabel, formatCompactPrice } from "../booking.utils";

describe("formatMoney", () => {
  it("formats a number as Vietnamese dong with dot separator", () => {
    expect(formatMoney(300000)).toBe("300.000đ");
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toBe("0đ");
  });

  it("formats small amounts without thousand separator", () => {
    expect(formatMoney(999)).toBe("999đ");
  });

  it("formats large amounts", () => {
    expect(formatMoney(1500000)).toBe("1.500.000đ");
  });
});

describe("addMinutes", () => {
  it("adds minutes correctly crossing the hour boundary", () => {
    expect(addMinutes("06:30", 90)).toBe("08:00");
  });

  it("adds minutes within the same hour", () => {
    expect(addMinutes("10:00", 30)).toBe("10:30");
  });

  it("adds zero minutes", () => {
    expect(addMinutes("14:00", 0)).toBe("14:00");
  });

  it("handles adding minutes past the end of the day", () => {
    expect(addMinutes("23:00", 60)).toBe("24:00");
  });

  it("adds a large number of minutes", () => {
    expect(addMinutes("06:30", 960)).toBe("22:30");
  });
});

describe("getRangeLabel", () => {
  it("returns start time and end time separated by dash", () => {
    expect(getRangeLabel("06:30")).toBe("06:30 - 08:00");
  });

  it("works with another time slot", () => {
    expect(getRangeLabel("17:00")).toBe("17:00 - 18:30");
  });

  it("works with the last slot", () => {
    expect(getRangeLabel("21:30")).toBe("21:30 - 23:00");
  });
});

describe("formatCompactPrice", () => {
  it("formats a large amount as compact price with k suffix", () => {
    expect(formatCompactPrice(300000)).toBe("300k");
  });

  it("formats null as 0k", () => {
    expect(formatCompactPrice(null)).toBe("0k");
  });

  it("formats undefined as 0k", () => {
    expect(formatCompactPrice(undefined)).toBe("0k");
  });

  it("formats zero as 0k", () => {
    expect(formatCompactPrice(0)).toBe("0k");
  });

  it("rounds to nearest thousand", () => {
    expect(formatCompactPrice(350000)).toBe("350k");
  });

  it("formats small amounts", () => {
    expect(formatCompactPrice(500)).toBe("1k");
  });
});
