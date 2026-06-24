import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateMatchModal } from "../CreateMatchModal";

const { mockCreateNewMatch } = vi.hoisted(() => ({
  mockCreateNewMatch: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/features/venue/api/venueApi", () => ({
  getVenues: vi.fn().mockResolvedValue([
    { id: 1, name: "Sân Test", address: "123 Test" },
  ]),
}));

vi.mock("@/features/matchmaking/api/matchmakingApi", () => ({
  createMatch: vi.fn().mockResolvedValue({}),
  getOpenMatches: vi.fn().mockResolvedValue([]),
  joinMatch: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/features/matchmaking/model/matchStore", () => ({
  useMatchStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      matches: [],
      loading: false,
      selectedVenueId: null,
      selectedSkillLevel: null,
      setFilters: vi.fn(),
      fetchMatches: vi.fn(),
      createNewMatch: mockCreateNewMatch,
      joinMatchAction: vi.fn(),
    }),
  ),
}));

import { getVenues } from "@/features/venue/api/venueApi";

describe("CreateMatchModal", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateNewMatch.mockResolvedValue({});
    vi.mocked(getVenues).mockResolvedValue([
      { id: 1, name: "Sân Test", address: "123 Test" },
    ]);
  });

  it("renders all form fields", async () => {
    render(<CreateMatchModal onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByText("Đăng ký tìm đối (Tạo kèo)")).toBeInTheDocument();
    expect(screen.getByText("Chọn khu sân")).toBeInTheDocument();
    expect(screen.getByText("Loại sân")).toBeInTheDocument();
    expect(screen.getByText("Trình độ yêu cầu")).toBeInTheDocument();
    expect(screen.getByText("Ngày thi đấu")).toBeInTheDocument();
    expect(screen.getByText("Chọn ca đá (Time Slot)")).toBeInTheDocument();
    expect(screen.getByText("Mô tả chi tiết")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox").length).toBeGreaterThanOrEqual(4);
  });

  it("shows error when submitting without venue", async () => {
    vi.mocked(getVenues).mockResolvedValueOnce([]);

    render(<CreateMatchModal onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByText("-- Chọn khu sân --")).toBeInTheDocument();
    });

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    expect(await screen.findByText("Vui lòng chọn khu sân.")).toBeInTheDocument();
  });

  it("shows error when submitting without date", async () => {
    render(<CreateMatchModal onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByText("Sân Test")).toBeInTheDocument();
    });

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    expect(await screen.findByText("Vui lòng chọn ngày thi đấu.")).toBeInTheDocument();
  });

  it("calls onClose when cancel button clicked", async () => {
    const user = userEvent.setup();
    render(<CreateMatchModal onClose={onClose} onSuccess={onSuccess} />);

    await user.click(screen.getByText("Hủy"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has submit button", () => {
    render(<CreateMatchModal onClose={onClose} onSuccess={onSuccess} />);
    expect(screen.getByRole("button", { name: /Xác nhận tạo kèo/ })).toBeInTheDocument();
  });
});
