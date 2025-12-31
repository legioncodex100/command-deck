
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Connection string from .env.local (manually injected)
const connectionString = "postgresql://postgres:1859%40purple@db.thmlzkxnrzimvssuqvxx.supabase.co:5432/postgres";

async function applyMigration() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase connection
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251231030000_create_invite_requests.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Applying migration...');
        await client.query(sql);

        console.log('Migration applied successfully.');
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
