import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TenantProvider, useTenant } from './tenant-context';

// Create a consumer component to access context
const TestConsumer = () => {
  const { tenant, loading } = useTenant();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="tenant">{tenant ? tenant.name : 'null'}</div>
    </div>
  );
};

describe('TenantProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.style.setProperty = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches tenant config successfully and updates context', async () => {
    const mockTenant = {
      id: '1',
      name: 'TestTenant',
      slug: 'test-tenant',
      theme: {
        primaryColor: '#ff0000',
        backgroundColor: '#00ff00',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTenant,
    });

    render(
      <TenantProvider>
        <TestConsumer />
      </TenantProvider>
    );

    // Initial state
    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('tenant').textContent).toBe('null');

    // Wait for fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('tenant').textContent).toBe('TestTenant');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--primary', '#ff0000');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--background', '#00ff00');
    expect(document.title).toBe('TestTenant | Premium Betting Exchange');
  });

  it('handles fetch failure gracefully on error path', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <TenantProvider>
        <TestConsumer />
      </TenantProvider>
    );

    // Initial state
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for fetch to fail and finally block to run
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('tenant').textContent).toBe('null');
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load tenant configuration:', expect.any(Error));
  });
});
