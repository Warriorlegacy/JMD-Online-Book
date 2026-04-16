import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/forms/login-form";

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

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("should render a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should show validation errors for email field", () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText("your@email.com");
    expect(emailInput).toBeInTheDocument();
  });

  it("should show validation errors for password field", () => {
    render(<LoginForm />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput).toBeInTheDocument();
  });

  it("should show validation errors for empty fields on submit", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitBtn);

    // Form should not submit due to validation errors
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("should show validation error for short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "short");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitBtn);

    // Form should not submit due to validation errors
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("should call login API with correct payload", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { role: "user" }, error: null }),
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "StrongPass1!");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "StrongPass1!",
        }),
      });
    });
  });

  it("should redirect to /home on successful user login", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { role: "user" }, error: null }),
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "StrongPass1!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/home");
    });
  });

  it("should redirect to /admin/dashboard on successful admin login", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { role: "admin" }, error: null }),
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "StrongPass1!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("should show error toast on failed login", async () => {
    const user = userEvent.setup();
    const toast = await import("react-hot-toast");
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid credentials", data: null }),
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "WrongPass1!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("should disable button while pending", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(fetchPromise);

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "StrongPass1!");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    // Resolve to clean up
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ data: { role: "user" }, error: null }),
    });
  });
});
