import {
  formatCurrency,
  formatVacancyRate,
  resolveDashboardFacilityId,
} from "../statistics.utils";

describe("formatCurrency", () => {
  it("formats amounts >= 1 billion as 'tỷ VNĐ'", () => {
    expect(formatCurrency(1_500_000_000)).toBe("1.50 tỷ VNĐ");
  });

  it("formats exactly 1 billion", () => {
    expect(formatCurrency(1_000_000_000)).toBe("1.00 tỷ VNĐ");
  });

  it("formats amounts >= 1 million as 'triệu VNĐ'", () => {
    expect(formatCurrency(5_500_000)).toBe("5.5 triệu VNĐ");
  });

  it("formats exactly 1 million", () => {
    expect(formatCurrency(1_000_000)).toBe("1.0 triệu VNĐ");
  });

  it("formats amounts < 1 million with locale separator", () => {
    expect(formatCurrency(100_000)).toBe("100.000 VNĐ");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("0 VNĐ");
  });

  it("formats small amounts", () => {
    expect(formatCurrency(500)).toBe("500 VNĐ");
  });
});

describe("formatVacancyRate", () => {
  it("formats a number rate with one decimal", () => {
    expect(formatVacancyRate(85.5)).toBe("85.5%");
  });

  it("formats a whole number rate", () => {
    expect(formatVacancyRate(100)).toBe("100.0%");
  });

  it("formats zero", () => {
    expect(formatVacancyRate(0)).toBe("0.0%");
  });

  it("returns string rate as-is", () => {
    expect(formatVacancyRate("N/A")).toBe("N/A");
  });

  it("returns a custom string rate as-is", () => {
    expect(formatVacancyRate("Không có dữ liệu")).toBe("Không có dữ liệu");
  });
});

describe("resolveDashboardFacilityId", () => {
  it('returns "ALL" when selectedFacilityId is "all"', () => {
    expect(resolveDashboardFacilityId("all")).toBe("ALL");
  });

  it("returns the selectedFacilityId when it is a numeric string", () => {
    expect(resolveDashboardFacilityId("123")).toBe("123");
  });

  it("returns the apiFacilityId when selected is non-numeric and api is valid", () => {
    expect(resolveDashboardFacilityId("abc", "456")).toBe("456");
  });

  it('returns "ALL" when selected is non-numeric and no apiFacilityId', () => {
    expect(resolveDashboardFacilityId("abc")).toBe("ALL");
  });

  it('returns "ALL" when selected is non-numeric and apiFacilityId is also non-numeric', () => {
    expect(resolveDashboardFacilityId("abc", "xyz")).toBe("ALL");
  });

  it('returns "ALL" when selected is empty string', () => {
    expect(resolveDashboardFacilityId("")).toBe("ALL");
  });
});
