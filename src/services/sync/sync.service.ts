import { dbService } from '../db/db';
import { apiClient } from '../api/client';
import { toast } from 'sonner';

/**
 * Sync Service
 * Handles processing of offline actions queue
 */

interface SyncItem {
  id: string;
  type: 'ALERT' | 'JOURNAL';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
}

export const syncService = {
  /**
   * Queue an action for sync
   */
  async queueAction(type: SyncItem['type'], action: SyncItem['action'], payload: any): Promise<void> {
    // Generate a unique ID for the queue item
    const id = `${type}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const item: SyncItem = {
      id,
      type,
      action,
      payload,
      timestamp: Date.now(),
    };

    // Save to IndexedDB syncQueue
    // Note: We need to expose a method in dbService to access the raw DB or add a specific method
    // For now, let's assume we add addToSyncQueue to dbService
    await dbService.addToSyncQueue(item);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  },

  /**
   * Process the sync queue
   */
  async processQueue(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const queue = await dbService.getSyncQueue();
      if (queue.length === 0) return;

      console.log(`[Sync] Processing ${queue.length} items...`);

      // Sort by timestamp to preserve order
      queue.sort((a, b) => a.timestamp - b.timestamp);

      for (const item of queue) {
        try {
          await this.processItem(item);
          // Remove from queue on success
          await dbService.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('[Sync] Failed to process item:', item, error);
          // Keep in queue? Or move to dead-letter queue?
          // For MVP: keep in queue, will retry next time. 
          // Ideally we should have a retry count.
        }
      }

      toast.success('Sync complete');
    } catch (error) {
      console.error('[Sync] Queue processing failed:', error);
    }
  },

  /**
   * Process a single item
   */
  async processItem(item: SyncItem): Promise<void> {
    const { type, action, payload } = item;

    // Map to API calls
    if (type === 'ALERT') {
      if (action === 'CREATE') {
        await apiClient.post('/alerts', payload);
      } else if (action === 'UPDATE') {
        await apiClient.put(`/alerts/${payload.id}`, payload);
      } else if (action === 'DELETE') {
        await apiClient.delete(`/alerts/${payload.id}`);
      }
    } else if (type === 'JOURNAL') {
      if (action === 'CREATE') {
        await apiClient.post('/journal', payload);
      } else if (action === 'UPDATE') {
        // Journal updates (confirm/archive) usually have specific endpoints or PUT
        if (payload.status === 'confirmed') {
          await apiClient.post(`/journal/${payload.id}/confirm`, payload.confirmData);
        } else if (payload.status === 'archived') {
          await apiClient.post(`/journal/${payload.id}/archive`, payload.archiveData);
        } else {
           // General update
           // await apiClient.put(`/journal/${payload.id}`, payload);
        }
      } else if (action === 'DELETE') {
        await apiClient.delete(`/journal/${payload.id}`);
      }
    }
  }
};

