import { describe, it, expect, vi } from 'vitest';
import { handleJournalList } from '../../routes/journal.js';
import * as repo from '../../domain/journal/repo.js';
import { sendJson } from '../../http/response.js';

// Mock dependencies
vi.mock('../../domain/journal/repo.js');
vi.mock('../../http/response.js', () => ({
  sendJson: vi.fn(),
  setCacheHeaders: vi.fn(),
}));

describe('Journal Routes', () => {
  it('should return lowercase status in list', () => {
    // Mock repo to return UPPERCASE status (Domain)
    vi.mocked(repo.journalList).mockReturnValue({
      items: [{
        id: '1',
        status: 'PENDING',
        userId: 'u1',
        side: 'BUY',
        timestamp: '2025-01-01T00:00:00Z',
        summary: 'test',
        dayKey: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }],
      nextCursor: undefined
    });

    const req = {
      query: {},
      userId: 'u1'
    } as any;
    
    const res = {} as any;
    
    handleJournalList(req, res);
    
    expect(sendJson).toHaveBeenCalledWith(res, {
      items: [expect.objectContaining({ status: 'pending' })],
      nextCursor: undefined
    });
  });
});

