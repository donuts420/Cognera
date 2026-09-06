import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, '../../db/schema.sql'), 'utf-8');
const seed = readFileSync(join(__dirname, '../../db/seed.sql'), 'utf-8');

async function runSeed() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Running schema...');
    await pool.query(schema);
    console.log('Running seed...');
    const passwordHash = await bcrypt.hash('password123', 12);
    const customizedSeed = seed.replace(/\$2b\$12\$LJ3m4ys4Gz8k5Q5Q5Q5Q5eN2r3k5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q/g, passwordHash);
    await pool.query(customizedSeed);
    console.log('Seed complete. All demo users have password: password123');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
