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
    // Production container path should just be /app/engine/target/release/sbe-engine
    // Or we should allow it to fail silently if the binary isn't built yet, without crashing the whole app.
    const enginePath = process.env.ENGINE_PATH || `/app/engine/target/release/${defaultEngine}`;
    if (process.env.NODE_ENV !== 'production') console.log(`[Engine] Starting matching engine: ${enginePath}`);
    
    try {
      this.process = spawn(enginePath);

      this.process.on("error", (err) => {
        if (process.env.NODE_ENV !== 'production') console.error(`[Engine] Failed to start engine at ${enginePath}. This is expected if the engine binary is not built yet.`, err.message);
      });

      this.process.stdout?.on("data", (data) => {
       const lines = data.toString().split("\n");
       for (const line of lines) {
         try {
           const trimmed = line.trim();
           if (!trimmed || !trimmed.startsWith('{')) {
             if (trimmed && process.env.NODE_ENV !== 'production') console.log(`[Engine Log] ${trimmed}`);
             continue;
           }
          const result = JSON.parse(trimmed);
          const resolve = this.responseQueue.shift();
          if (resolve) resolve(result);
        } catch (e) {
          console.error("[Engine] Parse error", e, "Line:", line);
        }
      }
    });

    this.process.stderr?.on("data", (data) => {
      console.error(`[Engine Error] ${data.toString()}`);
    });

    this.process.on("close", (code) => {
      if (process.env.NODE_ENV !== 'production') console.log(`[Engine] Process exited with code ${code}`);
      // Restart logic could go here
    });
    } catch (err: any) {
      console.error("[Engine] Spawn failed:", err.message);
    }
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
