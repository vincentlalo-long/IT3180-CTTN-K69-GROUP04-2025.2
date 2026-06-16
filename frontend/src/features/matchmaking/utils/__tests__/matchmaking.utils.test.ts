import { getDisplayStatus, getStatusClass, getTimeLeftText } from "../matchmaking.utils";
import type { MatchmakingPost } from "../../types/matchmaking.types";

const makePost = (overrides: Partial<MatchmakingPost>): MatchmakingPost => ({
  id: "1",
  teamName: "Team A",
  level: "Trung bình",
  fieldAndShift: "Sân 1 - 18:00",
  matchType: "Đấu giao hữu",
  status: "Đang tìm",
  matchDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

describe("getDisplayStatus", () => {
  it("returns original status when not searching", () => {
    const post = makePost({ status: "Đã chốt" });
    expect(getDisplayStatus(post)).toBe("Đã chốt");
  });

  it("returns 'Đang tìm' when match date is far in the future", () => {
    const post = makePost({
      status: "Đang tìm",
      matchDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    expect(getDisplayStatus(post)).toBe("Đang tìm");
  });

  it("returns 'Hết hạn' when status is 'Đang tìm' and match is within 3 hours", () => {
    const post = makePost({
      status: "Đang tìm",
      matchDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    expect(getDisplayStatus(post)).toBe("Hết hạn");
  });

  it("returns 'Hết hạn' when status is 'Đang tìm' and match date is past", () => {
    const post = makePost({
      status: "Đang tìm",
      matchDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    });
    expect(getDisplayStatus(post)).toBe("Hết hạn");
  });

  it("returns 'Bị hủy' when status is 'Bị hủy' even if within 3 hours", () => {
    const post = makePost({
      status: "Bị hủy",
      matchDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
    expect(getDisplayStatus(post)).toBe("Bị hủy");
  });
});

describe("getStatusClass", () => {
  it("returns animate-pulse cyan classes for 'Đang tìm'", () => {
    const classes = getStatusClass("Đang tìm");
    expect(classes).toContain("animate-pulse");
    expect(classes).toContain("cyan");
  });

  it("returns lime classes for 'Đã chốt'", () => {
    const classes = getStatusClass("Đã chốt");
    expect(classes).toContain("lime");
  });

  it("returns rose classes for 'Bị hủy'", () => {
    const classes = getStatusClass("Bị hủy");
    expect(classes).toContain("rose");
  });

  it("returns slate classes for unknown status", () => {
    const classes = getStatusClass("Hết hạn");
    expect(classes).toContain("slate");
  });
});

describe("getTimeLeftText", () => {
  it("returns past message for expired match", () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(getTimeLeftText(pastDate)).toBe("Đã quá giờ ghép kèo");
  });

  it("returns hours and minutes for future match", () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString();
    const result = getTimeLeftText(futureDate);
    expect(result).toMatch(/^Hết hạn sau \d+h \d+m$/);
  });

  it("returns only minutes when less than 1 hour", () => {
    const futureDate = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    const result = getTimeLeftText(futureDate);
    expect(result).toMatch(/^Hết hạn sau \d+m$/);
    expect(result).not.toMatch(/\d+h/);
  });
});
