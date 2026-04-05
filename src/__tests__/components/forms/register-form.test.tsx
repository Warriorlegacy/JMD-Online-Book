import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/forms/register-form";

// Mock dependencies
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render all form fields", () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("9876543210")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a strong password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter referral code")).toBeInTheDocument();
  });

  it("should render a submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("should show validation errors for empty required fields", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    const submitBtn = screen.getByRole("button", { name: /create account/i });
    await user.click(submitBtn);

    // Form should not submit due to validation errors
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("should show error for invalid email", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    await user.type(emailInput, "not-an-email");

    const submitBtn = screen.getByRole("button", { name: /create account/i });
    await user.click(submitBtn);

    // Form should not submit due to validation errors
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("should show error for weak password", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByPlaceholderText("Create a strong password");
    await user.type(passwordInput, "weak");

    const submitBtn = screen.getByRole("button", { name: /create account/i });
    await user.click(submitBtn);

    // Form should not submit due to validation errors
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("should submit with all fields filled correctly", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { role: "user" }, error: null }),
    });

    render(<RegisterForm />);

    await user.type(screen.getByPlaceholderText("Your full name"), "John Doe");
    await user.type(screen.getByPlaceholderText("your@email.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText("9876543210"), "9876543210");
    await user.type(screen.getByPlaceholderText("Create a strong password"), "SecurePass1!");
    await user.type(screen.getByPlaceholderText("Enter referral code"), "REF123");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    const callArgs = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(callArgs.fullName).toBe("John Doe");
    expect(callArgs.email).toBe("john@example.com");
    expect(callArgs.phone).toBe("9876543210");
    expect(callArgs.referralCode).toBe("REF123");
  });

  it("should submit without optional fields", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { role: "user" }, error: null }),
    });

    render(<RegisterForm />);

    await user.type(screen.getByPlaceholderText("Your full name"), "Jane");
    await user.type(screen.getByPlaceholderText("your@email.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("Create a strong password"), "SecurePass1!");

    // Skip phone and referral code (optional)
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callArgs = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(callArgs.fullName).toBe("Jane");
    expect(callArgs.email).toBe("jane@example.com");
  });

  it("should redirect to /home on successful registration", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { role: "user" }, error: null }),
    });

    render(<RegisterForm />);

    await user.type(screen.getByPlaceholderText("Your full name"), "John");
    await user.type(screen.getByPlaceholderText("your@email.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText("Create a strong password"), "SecurePass1!");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/home");
    });
  });

  it("should show error toast on failed registration", async () => {
    const user = userEvent.setup();
    const toast = await import("react-hot-toast");
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Email already exists", data: null }),
    });

    render(<RegisterForm />);

    await user.type(screen.getByPlaceholderText("Your full name"), "John");
    await user.type(screen.getByPlaceholderText("your@email.com"), "existing@example.com");
    await user.type(screen.getByPlaceholderText("Create a strong password"), "SecurePass1!");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith("Email already exists");
    });
  });

  it("should disable button while pending", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(fetchPromise);

    render(<RegisterForm />);

    await user.type(screen.getByPlaceholderText("Your full name"), "John");
    await user.type(screen.getByPlaceholderText("your@email.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText("Create a strong password"), "SecurePass1!");

    const submitBtn = screen.getByRole("button", { name: /create account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ data: { role: "user" }, error: null }),
    });
  });
});
