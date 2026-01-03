import { getKV } from '../kv/store.js';
import { AppSettingsV1 } from './types.js';

export async function getUserSettings(userId: string): Promise<AppSettingsV1> {
  const kv = getKV();
  const key = `settings:v1:user:${userId}`;
  
  try {
    const settings = await kv.get<AppSettingsV1>(key);
    if (settings) {
      return settings;
    }
  } catch (err) {
    console.error(`Failed to fetch settings for user ${userId}:`, err);
  }

  // Default to Free tier if not found or error
  return {
    tier: 'free',
    adminFailOpen: false,
  };
}

