import { kv } from '../kv';
import { AppSettingsV1 } from './types';
import { logger } from '../logger';

export async function getUserSettings(userId: string): Promise<AppSettingsV1> {
  const key = `settings:v1:user:${userId}`;
  
  try {
    const settings = await kv.get<AppSettingsV1>(key);
    if (settings) {
      return settings;
    }
  } catch (err) {
    logger.error(`Failed to fetch settings for user ${userId}`, { error: String(err) });
  }

  // Default to Free tier if not found or error
  return {
    tier: 'free',
    adminFailOpen: false,
  };
}

