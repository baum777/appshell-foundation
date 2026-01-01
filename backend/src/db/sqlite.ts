import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { logger } from '../observability/logger.js';

/**
 * SQLite Database Connection
 * Singleton pattern for connection management
 */

let db: Database.Database | null = null;

export function initDatabase(dbPath: string): Database.Database {
  if (db) {
    return db;
  }

  // Ensure directory exists
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    logger.info('Created database directory', { dir });
  }

  db = new Database(dbPath);
  
  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  logger.info('Database initialized', { path: dbPath });

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database closed');
  }
}

// For testing
export function resetDatabase(): void {
  db = null;
}
