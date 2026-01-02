import fs from 'fs';
import path from 'path';
import { pool } from './pool';

export async function migrate() {
  const client = await pool.connect();
  try {
    let applied: string[] = [];
    try {
      const res = await client.query('SELECT name FROM schema_migrations');
      applied = res.rows.map(r => r.name);
    } catch (e: any) {
      if (e.code === '42P01') { // undefined_table
        // Table doesn't exist, so no migrations applied yet.
      } else {
        throw e;
      }
    }

    const sqlDir = path.join(__dirname, 'sql');
    if (!fs.existsSync(sqlDir)) {
      throw new Error(`SQL directory not found at ${sqlDir}`);
    }
    
    const files = fs.readdirSync(sqlDir).sort();

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      if (applied.includes(file)) continue;

      console.log(`Applying migration: ${file}`);
      const content = fs.readFileSync(path.join(sqlDir, file), 'utf-8');
      
      await client.query('BEGIN');
      try {
        await client.query(content);
        // Ensure schema_migrations table exists for the first insert if 001 created it
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply ${file}`, e);
        throw e;
      }
    }
    console.log('Migrations up to date.');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

