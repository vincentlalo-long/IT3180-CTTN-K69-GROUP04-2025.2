import { renderHook, act } from "@testing-library/react";
import { useSlotSelection } from "../useSlotSelection";
import type { TimeSlotRange } from "@/features/venue/types/venue.types";

const slotA: TimeSlotRange = { startTime: "06:30", endTime: "08:00" };
const slotB: TimeSlotRange = { startTime: "08:00", endTime: "09:30" };

describe("useSlotSelection", () => {
  it("initial state is empty array", () => {
    const { result } = renderHook(() => useSlotSelection());
    expect(result.current.selectedSlots).toEqual([]);
  });

  it("toggleSlot adds slot to selection", () => {
    const { result } = renderHook(() => useSlotSelection());

    act(() => {
      result.current.toggleSlot(slotA);
    });

    expect(result.current.selectedSlots).toEqual([slotA]);
  });

  it("toggleSlot removes slot if already selected", () => {
    const { result } = renderHook(() => useSlotSelection());

    act(() => {
      result.current.toggleSlot(slotA);
    });
    expect(result.current.selectedSlots).toEqual([slotA]);

    act(() => {
      result.current.toggleSlot(slotA);
    });
    expect(result.current.selectedSlots).toEqual([]);
  });

  it("clearSlots empties selection", () => {
    const { result } = renderHook(() => useSlotSelection());

    act(() => {
      result.current.toggleSlot(slotA);
      result.current.toggleSlot(slotB);
    });
    expect(result.current.selectedSlots).toHaveLength(2);

    act(() => {
      result.current.clearSlots();
    });
    expect(result.current.selectedSlots).toEqual([]);
  });

  it("resets when resetKey changes", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => useSlotSelection({ resetKey }),
      { initialProps: { resetKey: ["2025-06-20"] } },
    );

    act(() => {
      result.current.toggleSlot(slotA);
    });
    expect(result.current.selectedSlots).toEqual([slotA]);

    rerender({ resetKey: ["2025-06-21"] });

    expect(result.current.selectedSlots).toEqual([]);
  });
});
