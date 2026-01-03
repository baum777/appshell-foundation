import { getKV } from '../../lib/kv/store.js';

const WATCHLIST_KEY_PREFIX = 'user:watchlist:';

export async function getWatchlist(userId: string): Promise<string[]> {
  const kv = getKV();
  const key = `${WATCHLIST_KEY_PREFIX}${userId}`;
  const list = await kv.get<string[]>(key);
  return list || [];
}

export async function addToWatchlist(userId: string, assetId: string): Promise<void> {
  const kv = getKV();
  const key = `${WATCHLIST_KEY_PREFIX}${userId}`;
  const list = await getWatchlist(userId);
  
  if (!list.includes(assetId)) {
    list.push(assetId);
    await kv.set(key, list);
  }
}

export async function removeFromWatchlist(userId: string, assetId: string): Promise<void> {
  const kv = getKV();
  const key = `${WATCHLIST_KEY_PREFIX}${userId}`;
  const list = await getWatchlist(userId);
  
  const newList = list.filter(id => id !== assetId);
  if (newList.length !== list.length) {
    await kv.set(key, newList);
  }
}

