import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectedSlotsBar } from "../SelectedSlotsBar";
import type { TimeSlotRange } from "@/features/venue/types/venue.types";

const slots: TimeSlotRange[] = [
  { startTime: "06:30", endTime: "08:00" },
  { startTime: "08:00", endTime: "09:30" },
];

describe("SelectedSlotsBar", () => {
  it("shows empty message when no slots selected", () => {
    render(<SelectedSlotsBar selectedSlots={[]} />);
    expect(screen.getByText("Chưa chọn khung giờ nào.")).toBeInTheDocument();
  });

  it("shows slot count and time ranges when slots selected", () => {
    render(<SelectedSlotsBar selectedSlots={slots} />);
    expect(screen.getByText("Đã chọn 2 khung giờ")).toBeInTheDocument();
    expect(screen.getByText("06:30-08:00, 08:00-09:30")).toBeInTheDocument();
  });

  it("shows price breakdown", () => {
    render(
      <SelectedSlotsBar
        selectedSlots={slots}
        fieldTotal={200000}
        serviceTotal={50000}
        totalPrice={250000}
      />,
    );
    expect(screen.getByText("Tiền sân: 200.000 VND")).toBeInTheDocument();
    expect(screen.getByText("Dịch vụ: 50.000 VND")).toBeInTheDocument();
    expect(screen.getByText("Tổng: 250.000 VND")).toBeInTheDocument();
  });

  it("calls onClear when clear button clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SelectedSlotsBar selectedSlots={slots} onClear={onClear} />);

    await user.click(screen.getByText("Xóa"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when submit button clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SelectedSlotsBar selectedSlots={slots} onSubmit={onSubmit} />);

    await user.click(screen.getByText("Đặt sân"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables submit button when disableSubmit=true", () => {
    render(<SelectedSlotsBar selectedSlots={slots} disableSubmit={true} />);
    const btn = screen.getByText("Đặt sân");
    expect(btn).toBeDisabled();
  });

  it("shows loading state when isSubmitting=true", () => {
    render(<SelectedSlotsBar selectedSlots={slots} isSubmitting={true} />);
    expect(screen.getByText("Đang xử lý...")).toBeInTheDocument();
    expect(screen.getByText("Xóa")).toBeDisabled();
  });
});
