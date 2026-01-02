import { Provider, AssetSnapshot } from './types';
import { nowISO } from '../../utils/time';

export class MockProvider implements Provider {
  async fetchSnapshot(assetId: string): Promise<AssetSnapshot> {
    // Deterministic pseudo-random based on time
    const now = Date.now();
    const timeSlice = Math.floor(now / 10000); // changes every 10s
    const base = assetId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    
    // Simulate some movement
    const random = Math.sin(timeSlice + base); 
    const price = 100 + (random * 10);
    
    // Simulate occasional volume spike
    const isSpike = Math.random() > 0.8;
    const volume = isSpike ? 5000 : 1000 + (Math.cos(timeSlice) * 500);

    return {
      ts: nowISO(),
      price: Number(price.toFixed(2)),
      volume: Number(volume.toFixed(0))
    };
  }
}

export const mockProvider = new MockProvider();

