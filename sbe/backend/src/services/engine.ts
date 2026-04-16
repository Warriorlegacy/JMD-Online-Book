import { spawn, ChildProcess } from "child_process";
import { pubsub } from "./pubsub.js";

export class OrderEngineBridge {
  private static instance: OrderEngineBridge;
  private process: ChildProcess | null = null;
  private responseQueue: ((data: any) => void)[] = [];

  private constructor() {
    this.init();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OrderEngineBridge();
    }
    return this.instance;
  }

  private init() {
    // Platform agnostic path
    const defaultEngine = process.platform === "win32" ? "sbe-engine.exe" : "sbe-engine";
    const enginePath = process.env.ENGINE_PATH || `../../engine/target/release/${defaultEngine}`;
    console.log(`[Engine] Starting matching engine: ${enginePath}`);
    
    try {
      this.process = spawn(enginePath);

      this.process.on("error", (err) => {
        console.error(`[Engine] Failed to start engine at ${enginePath}. This is expected if the engine binary is not built yet.`, err.message);
      });

      this.process.stdout?.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const result = JSON.parse(line);
          const resolve = this.responseQueue.shift();
          if (resolve) resolve(result);
        } catch (e) {
          console.error("[Engine] Parse error", e);
        }
      }
    });

    this.process.stderr?.on("data", (data) => {
      console.error(`[Engine Error] ${data.toString()}`);
    });

    this.process.on("close", (code) => {
      console.log(`[Engine] Process exited with code ${code}`);
      // Restart logic could go here
    });
  }

  async processOrder(order: any): Promise<any> {
    return new Promise((resolve) => {
      this.responseQueue.push(resolve);
      // Protocol: match_id|selection_id|user_id|side|price|stake
      const cmd = `${order.matchId}|${order.selectionId}|${order.userId}|${order.side}|${order.price}|${order.stake}\n`;
      this.process?.stdin?.write(cmd);
    });
  }
}

// Compatibility Wrapper for existing Orchestrator
export class OrderBook {
  private engine = OrderEngineBridge.getInstance();
  private lastSnapshot: any = { backs: [], lays: [] };

  async processOrder(order: any) {
    const result = await this.engine.processOrder({
      ...order,
      price: (order.price / 100).toFixed(2),
      stake: (order.stake / 100).toFixed(2),
    });

    this.lastSnapshot = result.snapshot;
    return result.trades;
  }

  getSnapshot() {
    return this.lastSnapshot;
  }
}
