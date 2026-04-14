import Redis from "ioredis";
// @ts-ignore
import RedisMock from "ioredis-mock";
import { EventEmitter } from "events";

const REDIS_URL = process.env.REDIS_URL;

class PubSubService {
  private client: Redis;
  private localEmitter = new EventEmitter();

  constructor() {
    if (REDIS_URL) {
      this.client = new Redis(REDIS_URL);
      console.log("Redis PubSub Initialized");
    } else {
      this.client = new RedisMock();
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
