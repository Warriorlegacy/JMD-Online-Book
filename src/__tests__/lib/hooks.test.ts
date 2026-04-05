import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebounce, useDebouncedCallback } from "@/lib/hooks";
import { act } from "@testing-library/react";

vi.useFakeTimers();

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should debounce value updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 500 } }
    );

    expect(result.current).toBe("first");

    // Update the value
    rerender({ value: "second", delay: 500 });

    // Value should still be "first" because delay hasn't passed
    expect(result.current).toBe("first");

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("second");
  });

  it("should not update value before delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } }
    );

    rerender({ value: "updated", delay: 300 });

    // Only 100ms passed, not enough
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("initial");

    // Complete the delay (300ms total from rerender)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("updated");
  });

  it("should reset timer on value change", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 500 } }
    );

    // Update at 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: "second", delay: 500 });

    // At 400ms from start (200ms after second update)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("first");

    // At 700ms from start (500ms after second update)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("second");
  });
});

describe("useDebouncedCallback", () => {
  it("should call the callback after the specified delay", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("arg1", "arg2");
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should only call once with the latest arguments when called rapidly", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    act(() => {
      result.current("first");
      result.current("second");
      result.current("third");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("third");
  });

  it("should cancel previous timeout on new call", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current("first");
    });

    // Advance but not enough to trigger
    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      result.current("second");
    });

    // First call's timer should be cancelled
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(callback).not.toHaveBeenCalled();

    // Second call's timer completes
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("should return a function with the same type", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, 100)
    );
    expect(typeof result.current).toBe("function");
  });
});
