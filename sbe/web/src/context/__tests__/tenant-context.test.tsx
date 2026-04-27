import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TenantProvider, useTenant } from '../tenant-context';

const TestComponent = () => {
  const { tenant, loading } = useTenant();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="tenant">{tenant ? JSON.stringify(tenant) : 'null'}</div>
    </div>
  );
};

describe('TenantProvider and useTenant', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockClear();
    document.title = '';
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--background');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides default loading state initially', async () => {
    let resolveFetch: any;
    global.fetch = vi.fn(() => new Promise((resolve) => {
      resolveFetch = resolve;
    })) as any;

    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('tenant').textContent).toBe('null');

    // Resolve the fetch so cleanup doesn't complain about hanging promises if any
    resolveFetch({ ok: true, json: () => Promise.resolve({}) });
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('fetches tenant config and applies theme and title', async () => {
    const mockConfig = {
      id: '123',
      name: 'Test Casino',
      slug: 'test-casino',
      theme: {
        primaryColor: '#ff0000',
        backgroundColor: '#00ff00',
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConfig,
    });

    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('tenant').textContent).toBe(JSON.stringify(mockConfig));
    expect(document.title).toBe('Test Casino | Premium Betting Exchange');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#ff0000');
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('#00ff00');
  });

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('tenant').textContent).toBe('null');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load tenant configuration:', expect.any(Error));
  });

  it('handles non-ok API responses gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('tenant').textContent).toBe('null');
  });
});
