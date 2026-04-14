"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type SocketMessage = {
  topic: string;
  room?: string;
  [key: string]: any;
};

export function useSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const listeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/ws");
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("[Socket] Connected to SBE Backend");
    };

    ws.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        const topicListeners = listeners.current.get(data.topic);
        if (topicListeners) {
          topicListeners.forEach((cb) => cb(data));
        }
      } catch (e) {
        console.error("[Socket] Message parse error", e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("[Socket] Disconnected");
    };

    return () => ws.close();
  }, []);

  const subscribe = useCallback((room: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "subscribe", room }));
    }
  }, []);

  const on = useCallback((topic: string, callback: (data: any) => void) => {
    if (!listeners.current.has(topic)) {
      listeners.current.set(topic, new Set());
    }
    listeners.current.get(topic)!.add(callback);
    return () => listeners.current.get(topic)?.delete(callback);
  }, []);

  return { connected, subscribe, on };
}
