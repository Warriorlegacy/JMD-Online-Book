import Redis from "ioredis";
// @ts-ignore
import RedisMock from "ioredis-mock";
import { EventEmitter } from "events";

const REDIS_URL = process.env.REDIS_URL;

class PubSubService {
  private client: any; // Using any for hybrid Mock/Real Redis compatibility in ESM
  private localEmitter = new EventEmitter();

  constructor() {
    if (REDIS_URL) {
      // @ts-ignore - ioredis ESM compatibility
      this.client = new Redis.default(REDIS_URL);
      console.log("Redis PubSub Initialized");
    } else {
      // @ts-ignore - ioredis-mock compatibility
      this.client = new RedisMock.default();
      console.log("In-memory Mock Redis Initialized");
    }
  }

  async publish(channel: string, message: any) {
    const data = JSON.stringify(message);
    await this.client.publish(channel, data);
    this.localEmitter.emit(channel, message);
  }

  subscribe(channel: string, callback: (message: any) => void) {
    this.localEmitter.on(channel, callback);
    // In a real Redis setup, we'd use this.client.subscribe(channel) 
    // and handle the message event. For our local hybrid, this works.
  }
}

export const pubsub = new PubSubService();
