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

  fastify.get("/ws", { websocket: true }, (connection: any, req: FastifyRequest) => {
    const userId = (req.query as any).userId || `anon_${Math.random().toString(36).slice(2, 7)}`;
    userConnections.set(userId, connection);

    connection.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe") {
          const room = msg.room;
           if (!roomSubscriptions.has(room)) roomSubscriptions.set(room, new Set());
           roomSubscriptions.get(room)!.add(userId);
           fastify.log.info(`[WS] User ${userId} subscribed to ${room}`);
         } else if (msg.type === "unsubscribe") {
           const room = msg.room;
           roomSubscriptions.get(room)?.delete(userId);
         } else if (msg.type === "chat_message") {
           const { room, text, user, role } = msg;
           manager.publishToRoom(room, "chat_message", { user, text, role, timestamp: Date.now() });
         } else if (msg.type === "notification") {
           // Admin or system notifications
           const { room, title, body, notifType } = msg;
           manager.publishToRoom(room || "global", "notification", { title, body, notifType, timestamp: Date.now() });
         }
       } catch (e) {
         fastify.log.error(e);
       }
    });

    connection.on("close", () => {
      userConnections.delete(userId);
      roomSubscriptions.forEach((subs) => subs.delete(userId));
    });

    connection.send(JSON.stringify({ type: "connection_ack", userId }));
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
      if (conn && conn.readyState === 1) {
        conn.send(JSON.stringify(message));
      }
    },
    publishToRoom: (room, topic, message) => {
      const subscribers = roomSubscriptions.get(room);
      if (subscribers) {
        subscribers.forEach(uid => {
          const conn = userConnections.get(uid);
          if (conn && conn.readyState === 1) {
            conn.send(JSON.stringify({ topic, room, ...message }));
          }
        });
      }
    }
  };

  fastify.decorate("ws", manager);
});
