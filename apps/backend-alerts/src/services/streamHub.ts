import { Response } from 'express';
import { env } from '../env';

class StreamHub {
  private connections: Map<string, Set<Response>> = new Map();

  constructor() {
    setInterval(() => this.heartbeat(), env.SSE_HEARTBEAT_MS);
  }

  add(userId: string, res: Response) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(res);

    res.on('close', () => {
      this.remove(userId, res);
    });
  }

  remove(userId: string, res: Response) {
    const set = this.connections.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  broadcast(userId: string, data: any) {
    const set = this.connections.get(userId);
    if (set) {
      const message = `event: alert_event\ndata: ${JSON.stringify(data)}\n\n`;
      set.forEach(res => res.write(message));
    }
  }

  private heartbeat() {
    const msg = `: ping ${new Date().toISOString()}\n\n`;
    for (const set of this.connections.values()) {
      set.forEach(res => res.write(msg));
    }
  }
}

export const streamHub = new StreamHub();

