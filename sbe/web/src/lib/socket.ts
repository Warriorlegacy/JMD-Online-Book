"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type MessageHandler = (data: any) => void;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      console.log("[Socket] Connected to Exchange");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const topic = data.topic;
        const topicHandlers = handlersRef.current.get(topic);
        if (topicHandlers) {
          topicHandlers.forEach(handler => handler(data));
        }
      } catch (e) {
        console.error("[Socket] Message parse error", e);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      console.log("[Socket] Disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  const subscribe = useCallback((room: string) => {
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
