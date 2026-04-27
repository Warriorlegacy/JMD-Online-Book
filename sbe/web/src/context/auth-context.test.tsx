import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './auth-context';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

const TestComponent = () => {
  const { user, loading, login, logout, register } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <>
          <div data-testid="user-info">{user.username}</div>
          <button onClick={() => logout()}>Logout</button>
        </>
      ) : (
        <>
          <div data-testid="no-user">Not logged in</div>
          <button onClick={() => login('testuser', 'password')}>Login</button>
          <button onClick={() => register('newuser', 'new@test.com', 'password')}>Register</button>
        </>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initially shows loading state and then fetches user', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'user' } }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');
    });
  });

  it('handles fetch user failure gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });
  });

  it('login updates user and token', async () => {
     (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'user' },
        status: 'SUCCESS'
      }),
    });

    act(() => {
        screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
      expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');
    });
  });

  it('logout clears user and token', async () => {
      (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'user' } }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });

    (global.fetch as any).mockResolvedValueOnce({
        ok: true
    });

    act(() => {
        screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });
  });

  it('register calls API correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    (global.fetch as any).mockResolvedValueOnce({
        ok: true
    });

    act(() => {
        screen.getByText('Register').click();
    });

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('newuser')
        }));
    });
  });

  it('throws error when useAuth is used outside of AuthProvider', () => {
      // Temporarily suppress console.error for this expected error test
      const originalConsoleError = console.error;
      console.error = vi.fn();

      expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalConsoleError;
  });
});
