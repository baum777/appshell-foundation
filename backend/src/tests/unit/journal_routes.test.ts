import { describe, it, expect, vi } from 'vitest';
import { handleJournalList } from '../../routes/journal.js';
import { journalService } from '../../domain/journal/service.js';
import { sendJson } from '../../http/response.js';

// Mock dependencies
vi.mock('../../domain/journal/service.js', () => ({
  journalService: {
    listEntries: vi.fn(),
    getEntry: vi.fn(),
    createEntry: vi.fn(),
    confirmEntry: vi.fn(),
    archiveEntry: vi.fn(),
    restoreEntry: vi.fn(),
    deleteEntry: vi.fn(),
  }
}));

vi.mock('../../http/response.js', () => ({
  sendJson: vi.fn(),
  setCacheHeaders: vi.fn(),
  sendCreated: vi.fn(),
  sendNoContent: vi.fn(),
}));

describe('Journal Routes', () => {
  it('should return lowercase status in list', async () => {
    // Mock service to return UPPERCASE status (Domain)
    vi.mocked(journalService.listEntries).mockResolvedValue({
      items: [{
        id: '1',
        status: 'PENDING',
        userId: 'u1',
        side: 'BUY',
        timestamp: '2025-01-01T00:00:00Z',
        summary: 'test',
        dayKey: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        // Optional fields default to undefined which is fine
      }],
      nextCursor: undefined
    });

    const req = {
      query: {},
      userId: 'u1'
    } as any;
    
    const res = {} as any;
    
    await handleJournalList(req, res);
    
    expect(sendJson).toHaveBeenCalledWith(res, {
      items: [expect.objectContaining({ status: 'pending' })],
      nextCursor: undefined
    });
  });
});
