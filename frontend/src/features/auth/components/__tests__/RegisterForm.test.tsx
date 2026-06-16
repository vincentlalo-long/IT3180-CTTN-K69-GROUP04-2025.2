import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RegisterForm } from "../RegisterForm";

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

const renderRegisterForm = (props?: { onSubmit?: (payload: unknown) => Promise<void> | void }) =>
  render(
    <MemoryRouter>
      <RegisterForm {...props} />
    </MemoryRouter>,
  );

beforeEach(() => {
  mockNavigate.mockClear();
});

describe("RegisterForm", () => {
  it("renders all form fields", () => {
    renderRegisterForm();

    expect(screen.getByPlaceholderText("Nhập họ tên")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email hoặc số điện thoại")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Xác nhận mật khẩu")).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.click(screen.getByText("Đăng ký"));

    expect(await screen.findByText("Vui lòng nhập họ tên.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập email hoặc số điện thoại.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mật khẩu.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng xác nhận mật khẩu.")).toBeInTheDocument();
  });

  it("shows error when passwords don't match", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByPlaceholderText("Nhập họ tên"), "Nguyen Van A");
    await user.type(screen.getByPlaceholderText("Email hoặc số điện thoại"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Mật khẩu"), "password123");
    await user.type(screen.getByPlaceholderText("Xác nhận mật khẩu"), "different123");
    await user.click(screen.getByText("Đăng ký"));

    expect(
      await screen.findByText("Mật khẩu xác nhận không khớp."),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with correct payload when form is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderRegisterForm({ onSubmit });

    await user.type(screen.getByPlaceholderText("Nhập họ tên"), "Nguyen Van A");
    await user.type(screen.getByPlaceholderText("Email hoặc số điện thoại"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Mật khẩu"), "password123");
    await user.type(screen.getByPlaceholderText("Xác nhận mật khẩu"), "password123");
    await user.click(screen.getByText("Đăng ký"));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        fullName: "Nguyen Van A",
        emailOrPhone: "test@example.com",
        password: "password123",
      });
    });
  });

  it("navigates to /login on successful registration", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderRegisterForm({ onSubmit });

    await user.type(screen.getByPlaceholderText("Nhập họ tên"), "Nguyen Van A");
    await user.type(screen.getByPlaceholderText("Email hoặc số điện thoại"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Mật khẩu"), "password123");
    await user.type(screen.getByPlaceholderText("Xác nhận mật khẩu"), "password123");
    await user.click(screen.getByText("Đăng ký"));

    await vi.waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      },
      { timeout: 5000 },
    );
  });

  it("shows global error when onSubmit throws", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Email already exists"));
    renderRegisterForm({ onSubmit });

    await user.type(screen.getByPlaceholderText("Nhập họ tên"), "Nguyen Van A");
    await user.type(screen.getByPlaceholderText("Email hoặc số điện thoại"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Mật khẩu"), "password123");
    await user.type(screen.getByPlaceholderText("Xác nhận mật khẩu"), "password123");
    await user.click(screen.getByText("Đăng ký"));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });
});
