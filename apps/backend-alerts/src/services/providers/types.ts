export interface AssetSnapshot {
  ts: string;
  price: number;
  volume: number;
}

export interface Provider {
  fetchSnapshot(assetId: string): Promise<AssetSnapshot>;
}

