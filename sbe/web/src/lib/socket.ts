"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type MessageHandler = (data: any) => void;

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const subscribedRoomsRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        reconnectAttemptRef.current = 0;
        // Re-subscribe to all rooms
        subscribedRoomsRef.current.forEach(room => {
          socket.send(JSON.stringify({ type: "subscribe", room }));
        });
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const topic = data.topic;
          const topicHandlers = handlersRef.current.get(topic);
          if (topicHandlers) topicHandlers.forEach(h => h(data));
        } catch (e) {
          console.error("[Socket] Parse error", e);
        }
      };

      socket.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
        reconnectAttemptRef.current++;
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (e) {
      console.error("[Socket] Connection error", e);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const subscribe = useCallback((room: string) => {
    subscribedRoomsRef.current.add(room);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "subscribe", room }));
    }
  }, []);

  const on = useCallback(<T = any>(topic: string, handler: (data: T) => void) => {
    const messageHandler = handler as unknown as MessageHandler;
    if (!handlersRef.current.has(topic)) {
      handlersRef.current.set(topic, new Set());
    }
    handlersRef.current.get(topic)!.add(messageHandler);
    return () => {
      handlersRef.current.get(topic)?.delete(messageHandler);
    };
  }, []);

  return { connected, subscribe, on };
}
