import { EventEmitter } from "events";

class PubSubService {
  private localEmitter = new EventEmitter();

  async publish(channel: string, message: any) {
    this.localEmitter.emit(channel, message);
  }

  subscribe(channel: string, callback: (message: any) => void) {
    this.localEmitter.on(channel, callback);
  }
}

export const pubsub = new PubSubService();
