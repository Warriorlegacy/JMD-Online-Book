import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { AuthProvider, useAuth } from "./auth-context";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUser = {
  id: "1",
  username: "testuser",
  email: "test@example.com",
  role: "user",
};

// Helper component to access context
const TestComponent = () => {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="loading">{auth.loading ? "true" : "false"}</div>
      <div data-testid="user">{auth.user ? auth.user.username : "null"}</div>
      <div data-testid="token">{auth.token ? auth.token : "null"}</div>
      <button onClick={() => auth.login("testuser", "password")}>Login</button>
      <button onClick={() => auth.login("mfauser", "password")}>Login MFA</button>
      <button onClick={() => auth.login("failuser", "password").catch(e => { document.getElementById("error")!.textContent = e.message })}>Login Fail</button>
      <button onClick={() => auth.register("newuser", "new@test.com", "pass")}>Register</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <div id="error" data-testid="error"></div>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("checks auth on mount and sets user on success", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading should be true, then false after checkAuth
    expect(screen.getByTestId("loading").textContent).toBe("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/me");
    expect(screen.getByTestId("user").textContent).toBe("testuser");
  });

  it("checks auth on mount and sets null on failure", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("login successfully sets user, token and redirects", async () => {
    // Initial checkAuth mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    // Login mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "SUCCESS", token: "mock-token", user: mockUser }),
    });

    act(() => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", expect.any(Object));
      expect(screen.getByTestId("user").textContent).toBe("testuser");
      expect(screen.getByTestId("token").textContent).toBe("mock-token");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("login handles MFA requirement", async () => {
     // Initial checkAuth mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    // Login mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "MFA_REQUIRED", mfaToken: "mock-mfa-token" }),
    });

    act(() => {
      screen.getByText("Login MFA").click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", expect.any(Object));
      expect(screen.getByTestId("user").textContent).toBe("null"); // User should not be set
      expect(screen.getByTestId("token").textContent).toBe("null"); // Token should not be set
      expect(mockPush).not.toHaveBeenCalled(); // Should not redirect yet
    });
  });

  it("login handles failure correctly", async () => {
    // Initial checkAuth mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    // Login mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    act(() => {
      screen.getByText("Login Fail").click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", expect.any(Object));
      expect(screen.getByTestId("error").textContent).toBe("Invalid credentials");
      expect(screen.getByTestId("user").textContent).toBe("null");
    });
  });

  it("register redirects to login on success", async () => {
     // Initial checkAuth mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    // Register mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    act(() => {
      screen.getByText("Register").click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("logout clears user, token and redirects", async () => {
     // Initial checkAuth mock to set initial state
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("testuser");
    });

    // Login mock to get a token, but we'll bypass full login and just test logout which resets state.
    // Actually the mock token doesn't matter much since logout sets it to null.

    // Logout mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", expect.any(Object));
      expect(screen.getByTestId("user").textContent).toBe("null");
      expect(screen.getByTestId("token").textContent).toBe("null");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("throws error if useAuth is used outside AuthProvider", () => {
    // Suppress console.error for expected error boundary
    const consoleError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow("useAuth must be used within an AuthProvider");

    console.error = consoleError;
  });
});
