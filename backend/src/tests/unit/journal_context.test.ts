import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JournalService } from '../../domain/journal/service.js';
import { journalRepoSQLite } from '../../domain/journal/repo.js';
import type { JournalCreateRequest } from '../../domain/journal/types.js';

// Mock repo
vi.mock('../../domain/journal/repo.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../domain/journal/repo.js')>();
  return {
    ...actual,
    journalRepoSQLite: {
      putEvent: vi.fn(),
      getEvent: vi.fn(),
    },
  };
});

describe('JournalService Context Enrichment', () => {
  let service: JournalService;
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new JournalService();
  });

  it('persists provided context without enrichment', async () => {
    const request: JournalCreateRequest = {
      side: 'BUY',
      summary: 'Test trade',
      assetId: 'solana-token-123',
      onchainContext: {
        capturedAt: new Date().toISOString(),
        priceUsd: 100,
        liquidityUsd: 50000,
        volume24h: 1000,
        marketCap: 1000000,
        ageMinutes: 60,
        holders: 100,
        transfers24h: 10,
      }
    };

    const event = await service.createEntry(userId, request);

    expect(event.contextStatus).toBe('complete');
    expect(event.onchainContext).toEqual(request.onchainContext);
    expect(journalRepoSQLite.putEvent).toHaveBeenCalledWith(userId, expect.objectContaining({
      contextStatus: 'complete',
      onchainContext: request.onchainContext
    }));
  });

  it('does not block writes: marks status missing when assetId is present but context is not provided', async () => {
    const request: JournalCreateRequest = {
      side: 'BUY',
      summary: 'Test trade',
      assetId: 'solana-token-123',
    };

    const event = await service.createEntry(userId, request);

    expect(event.contextStatus).toBe('missing');
    expect(event.onchainContext).toBeUndefined();
    expect(journalRepoSQLite.putEvent).toHaveBeenCalledWith(userId, expect.objectContaining({
      contextStatus: 'missing'
    }));
  });

  it('ignores context logic if no assetId provided', async () => {
    const request: JournalCreateRequest = {
      side: 'BUY',
      summary: 'Manual entry',
    };

    const event = await service.createEntry(userId, request);

    expect(event.contextStatus).toBeUndefined();
    expect(event.onchainContext).toBeUndefined();
    expect(event.assetId).toBeUndefined();
  });
});

