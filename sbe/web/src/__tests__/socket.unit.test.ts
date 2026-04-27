import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSocket } from "@/lib/socket";

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static CONNECTING = 0;
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState: number = 0; // WebSocket.CONNECTING

  static instances: MockWebSocket[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send = vi.fn();

  close = vi.fn(() => {
    this.readyState = 3; // WebSocket.CLOSED
    if (this.onclose) {
      this.onclose();
    }
  });

  // Test helpers
  triggerOpen() {
    this.readyState = 1; // WebSocket.OPEN
    if (this.onopen) this.onopen();
  }

  triggerMessage(data: any) {
    if (this.onmessage) this.onmessage({ data: typeof data === 'string' ? data : JSON.stringify(data) });
  }

  triggerClose() {
    this.readyState = 3; // WebSocket.CLOSED
    if (this.onclose) this.onclose();
  }

  triggerError() {
    if (this.onerror) this.onerror();
  }
}

describe("useSocket hook", () => {
  let originalWebSocket: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalWebSocket = global.WebSocket;
    global.WebSocket = MockWebSocket as any;
    MockWebSocket.instances = [];

    originalEnv = process.env;
    process.env = { ...originalEnv };

    vi.useFakeTimers();
  });

  afterEach(() => {
    global.WebSocket = originalWebSocket;
    process.env = originalEnv;
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("should connect to the WebSocket URL on mount", () => {
    process.env.NEXT_PUBLIC_WS_URL = "wss://test.com/ws";
    renderHook(() => useSocket());

    expect(MockWebSocket.instances.length).toBe(1);
    expect(MockWebSocket.instances[0].url).toBe("wss://test.com/ws");
  });

  it("should set connected state when socket opens", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.connected).toBe(false);

    act(() => {
      MockWebSocket.instances[0].triggerOpen();
    });

    expect(result.current.connected).toBe(true);
  });

  it("should handle topic messages correctly", () => {
    const { result } = renderHook(() => useSocket());
    const handler = vi.fn();

    act(() => {
      result.current.on("test-topic", handler);
      MockWebSocket.instances[0].triggerOpen();
    });

    act(() => {
      MockWebSocket.instances[0].triggerMessage({ topic: "test-topic", payload: "data" });
    });

    expect(handler).toHaveBeenCalledWith({ topic: "test-topic", payload: "data" });

    // Should ignore messages for other topics
    act(() => {
      MockWebSocket.instances[0].triggerMessage({ topic: "other-topic", payload: "data" });
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe from topics correctly", () => {
    const { result } = renderHook(() => useSocket());
    const handler = vi.fn();

    let unsubscribe: () => void;

    act(() => {
      unsubscribe = result.current.on("test-topic", handler);
      MockWebSocket.instances[0].triggerOpen();
    });

    act(() => {
      unsubscribe();
    });

    act(() => {
      MockWebSocket.instances[0].triggerMessage({ topic: "test-topic", payload: "data" });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("should send subscription message when subscribing", () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      MockWebSocket.instances[0].triggerOpen();
    });

    // In our MockWebSocket, readyState 1 is OPEN. The hook checks for WebSocket.OPEN, which is 1.
    // Ensure our mock sets readyState correctly.

    act(() => {
      result.current.subscribe("room1");
    });

    expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith(
      JSON.stringify({ type: "subscribe", room: "room1" })
    );
  });

  it("should resubscribe to all rooms on reconnect", () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.subscribe("room1");
      result.current.subscribe("room2");
      // Open triggers resubscription
      MockWebSocket.instances[0].triggerOpen();
    });

    expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith(
      JSON.stringify({ type: "subscribe", room: "room1" })
    );
    expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith(
      JSON.stringify({ type: "subscribe", room: "room2" })
    );
  });

  it("should attempt to reconnect on close with exponential backoff", () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      MockWebSocket.instances[0].triggerOpen();
    });

    expect(result.current.connected).toBe(true);

    act(() => {
      MockWebSocket.instances[0].triggerClose();
    });

    expect(result.current.connected).toBe(false);
    expect(MockWebSocket.instances.length).toBe(1);

    // First reconnect delay is 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockWebSocket.instances.length).toBe(2);

    // Close second connection
    act(() => {
      MockWebSocket.instances[1].triggerClose();
    });

    // Second reconnect delay is 2000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(MockWebSocket.instances.length).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(MockWebSocket.instances.length).toBe(3);
  });

  it("should close the socket and cleanup on unmount", () => {
    const { unmount } = renderHook(() => useSocket());

    expect(MockWebSocket.instances.length).toBe(1);

    unmount();

    expect(MockWebSocket.instances[0].close).toHaveBeenCalled();
  });

  it("should close socket on error", () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      MockWebSocket.instances[0].triggerOpen();
      MockWebSocket.instances[0].triggerError();
    });

    expect(MockWebSocket.instances[0].close).toHaveBeenCalled();
  });

  it("should not crash on invalid JSON message", () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHook(() => useSocket());

    act(() => {
      MockWebSocket.instances[0].triggerOpen();
      MockWebSocket.instances[0].triggerMessage("invalid json");
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
