import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingConfirmModal } from "../BookingConfirmModal";
import type { SlotDisplayItem } from "../SlotsGrid";

const defaultSlots: SlotDisplayItem[] = [
  { slot: { startTime: "06:30", endTime: "08:00" }, status: "selected", price: 150000 },
  { slot: { startTime: "08:00", endTime: "09:30" }, status: "selected", price: 180000 },
];

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  isSubmitting: false,
  pitchName: "Sân ABC",
  bookingDate: "2025-06-20",
  slots: defaultSlots,
  totalPrice: 330000,
  error: null,
};

describe("BookingConfirmModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when open=false", () => {
    const { container } = render(<BookingConfirmModal {...defaultProps} open={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows pitch name and formatted date", () => {
    render(<BookingConfirmModal {...defaultProps} />);
    expect(screen.getByText("Sân ABC")).toBeInTheDocument();
    expect(screen.getByText("20/06/2025")).toBeInTheDocument();
  });

  it("shows slot list with prices", () => {
    render(<BookingConfirmModal {...defaultProps} />);
    expect(screen.getByText("06:30 – 08:00")).toBeInTheDocument();
    expect(screen.getByText("08:00 – 09:30")).toBeInTheDocument();
    expect(screen.getByText("150.000₫")).toBeInTheDocument();
    expect(screen.getByText("180.000₫")).toBeInTheDocument();
  });

  it("shows total price", () => {
    render(<BookingConfirmModal {...defaultProps} />);
    expect(screen.getByText("330.000₫")).toBeInTheDocument();
  });

  it("shows error message when error provided", () => {
    render(<BookingConfirmModal {...defaultProps} error="Đã có lỗi xảy ra" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Đã có lỗi xảy ra");
  });

  it("calls onConfirm when confirm button clicked", async () => {
    const user = userEvent.setup();
    render(<BookingConfirmModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Xác nhận đặt sân" }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop clicked", async () => {
    const user = userEvent.setup();
    render(<BookingConfirmModal {...defaultProps} />);

    const backdrop = screen.getByRole("dialog");
    await user.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when isSubmitting", () => {
    render(<BookingConfirmModal {...defaultProps} isSubmitting={true} />);
    expect(screen.getByText("Đang xử lý...")).toBeInTheDocument();
  });
});
