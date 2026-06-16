import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { VenueCard } from "../VenueCard";
import type { VenueItem } from "@/features/venue/types/venue.types";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../../assets/images/Old_Trafford.jpg", () => ({ default: "field.jpg" }));
vi.mock("../../../../assets/images/logo-ball.jpg", () => ({ default: "logo.jpg" }));

const mockVenue: VenueItem = {
  id: 42,
  name: "Sân Gold",
  address: "123 Đường ABC, Quận 1",
  imageUrl: "https://example.com/field.jpg",
  openTime: "08:00",
  minPrice: 150000,
  averageRating: 4.5,
  reviewCount: 20,
};

const renderCard = (props?: { data?: VenueItem; bookingDate?: string }) =>
  render(
    <MemoryRouter>
      <VenueCard data={props?.data ?? mockVenue} bookingDate={props?.bookingDate} />
    </MemoryRouter>,
  );

beforeEach(() => {
  mockNavigate.mockClear();
});

describe("VenueCard", () => {
  it("renders venue name", () => {
    renderCard();
    expect(screen.getByText("Sân Gold")).toBeInTheDocument();
  });

  it("renders address", () => {
    renderCard();
    expect(screen.getByText("123 Đường ABC, Quận 1")).toBeInTheDocument();
  });

  it("renders min price formatted", () => {
    renderCard();
    expect(screen.getByText("150.000đ")).toBeInTheDocument();
  });

  it("renders rating and review count", () => {
    renderCard();
    expect(screen.getByText("4.5 (20)")).toBeInTheDocument();
  });

  it("navigates to /booking/{id} when clicked", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/booking/42");
  });

  it("navigates with date query param when bookingDate provided", async () => {
    const user = userEvent.setup();
    renderCard({ bookingDate: "2025-07-01" });

    await user.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/booking/42?date=2025-07-01");
  });
});
