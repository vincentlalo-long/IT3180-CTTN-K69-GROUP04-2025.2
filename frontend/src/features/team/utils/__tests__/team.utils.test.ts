import { clampReputation, getStatusMeta, getReputationTone } from "../team.utils";
import type { TeamStatus } from "../../types/team.types";

describe("clampReputation", () => {
  it("returns the value when within range", () => {
    expect(clampReputation(50)).toBe(50);
  });

  it("clamps negative values to 0", () => {
    expect(clampReputation(-10)).toBe(0);
  });

  it("clamps values above 100 to 100", () => {
    expect(clampReputation(150)).toBe(100);
  });

  it("returns 0 for 0", () => {
    expect(clampReputation(0)).toBe(0);
  });

  it("returns 100 for 100", () => {
    expect(clampReputation(100)).toBe(100);
  });

  it("handles decimal values", () => {
    expect(clampReputation(50.5)).toBe(50.5);
  });
});

describe("getStatusMeta", () => {
  it("returns correct label and class for APPROVED", () => {
    const meta = getStatusMeta("APPROVED" as TeamStatus);
    expect(meta.label).toBe("Đã duyệt");
    expect(meta.className).toContain("lime");
  });

  it("returns correct label and class for PENDING", () => {
    const meta = getStatusMeta("PENDING" as TeamStatus);
    expect(meta.label).toBe("Chờ duyệt");
    expect(meta.className).toContain("amber");
  });

  it("returns correct label and class for BANNED", () => {
    const meta = getStatusMeta("BANNED" as TeamStatus);
    expect(meta.label).toBe("Bị cấm");
    expect(meta.className).toContain("rose");
  });

  it("returns default label and class for REJECTED", () => {
    const meta = getStatusMeta("REJECTED" as TeamStatus);
    expect(meta.label).toBe("Từ chối");
    expect(meta.className).toContain("rose");
  });
});

describe("getReputationTone", () => {
  it("returns lime for reputation > 80", () => {
    expect(getReputationTone(90)).toBe("bg-lime-300");
  });

  it("returns rose for reputation < 20", () => {
    expect(getReputationTone(10)).toBe("bg-rose-400");
  });

  it("returns amber for reputation between 20 and 80 inclusive", () => {
    expect(getReputationTone(50)).toBe("bg-amber-300");
  });

  it("returns amber for exactly 80", () => {
    expect(getReputationTone(80)).toBe("bg-amber-300");
  });

  it("returns amber for exactly 20", () => {
    expect(getReputationTone(20)).toBe("bg-amber-300");
  });

  it("returns lime for 100", () => {
    expect(getReputationTone(100)).toBe("bg-lime-300");
  });

  it("returns rose for 0", () => {
    expect(getReputationTone(0)).toBe("bg-rose-400");
  });
});
