const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log("Initializing Neural Migration...");

    // Check for Connection String
    const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("CRITICAL: Missing DATABASE_URL or SUPABASE_DB_URL in .env.local");
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
    });

    try {
        await client.connect();

        const sqlPath = path.join(__dirname, '../supabase/migrations/20251230000700_create_ai_crew_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Executing SQL Bundle: create_ai_crew_table.sql");
        await client.query(sql);

        console.log("SUCCESS: Synthetic Division Established.");
    } catch (err) {
        console.error("MIGRATION FAILED:", err);
    } finally {
        await client.end();
    }
}

migrate();
