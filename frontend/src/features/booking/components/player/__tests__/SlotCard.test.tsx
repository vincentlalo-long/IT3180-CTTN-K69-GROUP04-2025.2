import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotCard } from "../SlotCard";
import type { TimeSlotRange } from "@/features/venue/types/venue.types";

const defaultSlot: TimeSlotRange = { startTime: "06:30", endTime: "08:00" };

describe("SlotCard", () => {
  it("renders time range correctly", () => {
    render(<SlotCard slot={defaultSlot} status="available" />);
    expect(screen.getByText("06:30-08:00")).toBeInTheDocument();
  });

  it("renders price when provided", () => {
    render(<SlotCard slot={defaultSlot} status="available" price={150000} />);
    expect(screen.getByText("150.000 VND")).toBeInTheDocument();
  });

  it("does not render price when not provided", () => {
    render(<SlotCard slot={defaultSlot} status="available" />);
    expect(screen.queryByText(/VND/)).not.toBeInTheDocument();
  });

  it("calls onToggle when clicked (available slot)", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SlotCard slot={defaultSlot} status="available" onToggle={onToggle} />);

    await user.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledWith(defaultSlot);
  });

  it("does not call onToggle when clicked (booked slot)", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SlotCard slot={defaultSlot} status="booked" onToggle={onToggle} />);

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("does not call onToggle when clicked (pending slot)", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SlotCard slot={defaultSlot} status="pending" onToggle={onToggle} />);

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("applies correct CSS class for selected status", () => {
    render(<SlotCard slot={defaultSlot} status="selected" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-indigo-600");
  });

  it("applies correct CSS class for available status", () => {
    render(<SlotCard slot={defaultSlot} status="available" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-emerald-50");
  });

  it("applies correct CSS class for booked status", () => {
    render(<SlotCard slot={defaultSlot} status="booked" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-gray-100");
  });

  it("applies correct CSS class for pending status", () => {
    render(<SlotCard slot={defaultSlot} status="pending" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-amber-50");
  });
});
