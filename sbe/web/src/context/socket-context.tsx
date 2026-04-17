"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/auth-context";

type MessageHandler = (data: unknown) => void;

interface SocketContextType {
  connected: boolean;
  subscribe: (room: string) => void;
  on: <T = any>(topic: string, handler: (data: T) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const subscribedRoomsRef = useRef<Set<string>>(new Set());

  const connect = useCallback(function doConnect() {
    if (!mountedRef.current) return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://jmd-online-book.onrender.com/ws";

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        reconnectAttemptRef.current = 0;
        if (token) {
          socket.send(JSON.stringify({ type: "auth", token }));
        }
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
        reconnectTimerRef.current = setTimeout(doConnect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (e) {
      console.error("[Socket] Connection error", e);
    }
  }, [token]);

   useEffect(() => {
     mountedRef.current = true;
     connect();
     return () => {
       mountedRef.current = false;
       if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
       socketRef.current?.close();
     };
   }, [connect]);

   useEffect(() => {
     if (connected && token && socketRef.current?.readyState === WebSocket.OPEN) {
       socketRef.current.send(JSON.stringify({ type: "auth", token }));
     }
   }, [connected, token]);

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

  return (
    <SocketContext.Provider value={{ connected, subscribe, on }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
