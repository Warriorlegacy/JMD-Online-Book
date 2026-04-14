import { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export interface WsManager {
  broadcast: (topic: string, message: any) => void;
  sendToUser: (userId: string, message: any) => void;
  publishToRoom: (room: string, topic: string, message: any) => void;
}

declare module "fastify" {
  interface FastifyInstance {
    ws: WsManager;
  }
}

export default fp(async function wsManagerPlugin(fastify: FastifyInstance) {
  const userConnections = new Map<string, any>();
  const roomSubscriptions = new Map<string, Set<string>>(); // room -> Set<userId>

  fastify.get("/ws", { websocket: true }, (connection, req) => {
    const userId = (req.query as any).userId || `anon_${Math.random().toString(36).slice(2, 7)}`;
    userConnections.set(userId, connection);

    connection.socket.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe") {
          const room = msg.room;
          if (!roomSubscriptions.has(room)) roomSubscriptions.set(room, new Set());
          roomSubscriptions.get(room)!.add(userId);
          console.log(`[WS] User ${userId} subscribed to ${room}`);
        } else if (msg.type === "unsubscribe") {
          const room = msg.room;
          roomSubscriptions.get(room)?.delete(userId);
        }
      } catch (e) {
        console.error("[WS] Decode error", e);
      }
    });

    connection.socket.on("close", () => {
      userConnections.delete(userId);
      roomSubscriptions.forEach((subs) => subs.delete(userId));
    });
    
    connection.socket.send(JSON.stringify({ type: "connection_ack", userId }));
  });

  const manager: WsManager = {
    broadcast: (topic, message) => {
      fastify.websocketServer.clients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ topic, ...message }));
        }
      });
    },
    sendToUser: (userId, message) => {
      const conn = userConnections.get(userId);
      if (conn && conn.socket.readyState === 1) {
        conn.socket.send(JSON.stringify(message));
      }
    },
    publishToRoom: (room, topic, message) => {
      const subscribers = roomSubscriptions.get(room);
      if (subscribers) {
        subscribers.forEach(uid => {
          const conn = userConnections.get(uid);
          if (conn && conn.socket.readyState === 1) {
            conn.socket.send(JSON.stringify({ topic, room, ...message }));
          }
        });
      }
    }
  };

  fastify.decorate("ws", manager);
});
