import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginForm } from "../LoginForm";

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

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div data-testid="google-login" />,
}));

const renderLoginForm = (props?: { onSubmit?: (payload: unknown) => Promise<void> | void }) =>
  render(
    <MemoryRouter>
      <LoginForm {...props} />
    </MemoryRouter>,
  );

beforeEach(() => {
  mockNavigate.mockClear();
});

describe("LoginForm", () => {
  it("renders email/phone and password inputs", () => {
    renderLoginForm();

    expect(screen.getByPlaceholderText("Email hoặc số điện thoại")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mật khẩu")).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByText("Chủ sân"));

    expect(
      await screen.findByText("Vui lòng nhập email hoặc số điện thoại."),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mật khẩu.")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByPlaceholderText("Email hoặc số điện thoại"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Mật khẩu"), "123");
    await user.click(screen.getByText("Chủ sân"));

    expect(
      await screen.findByText("Mật khẩu cần ít nhất 6 ký tự."),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with correct payload when form is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderLoginForm({ onSubmit });

    await user.type(screen.getByPlaceholderText("Email hoặc số điện thoại"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Mật khẩu"), "password123");
    await user.click(screen.getByText("Khách hàng"));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        role: "PLAYER",
        identifier: "test@example.com",
        password: "password123",
      });
    });
  });

  it("has 'Chủ sân' and 'Khách hàng' buttons", () => {
    renderLoginForm();

    expect(screen.getByText("Chủ sân")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
  });

  it("toggles password visibility when eye button is clicked", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByPlaceholderText("Mật khẩu");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByLabelText("Hiện mật khẩu");
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByLabelText("Ẩn mật khẩu"));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows global error when onSubmit throws", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Login failed"));
    renderLoginForm({ onSubmit });

    await user.type(screen.getByPlaceholderText("Email hoặc số điện thoại"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Mật khẩu"), "password123");
    await user.click(screen.getByText("Chủ sân"));

    expect(
      await screen.findByText("Đăng nhập thất bại. Vui lòng thử lại."),
    ).toBeInTheDocument();
  });
});
