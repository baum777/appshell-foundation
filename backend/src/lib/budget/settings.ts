import { AppSettingsV1 } from './types.js';

export async function getUserSettings(userId: string): Promise<AppSettingsV1> {
  // TODO: Fetch from DB or Profile Service
  // For now, return default Free tier, or Pro if specific user
  
  if (userId === 'pro-user') {
      return {
          tier: 'pro',
          adminFailOpen: false
      };
  }
  
  if (userId === 'admin') {
      return {
          tier: 'whale',
          adminFailOpen: true
      };
  }

  return {
    tier: 'free',
    adminFailOpen: false,
  };
}

