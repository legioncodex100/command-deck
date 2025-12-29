"use server";

import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';

const CORE_PROJECT_ID = 'c0de0000-0000-0000-0000-000000000000';
const MEMORY_FILE_PATH = path.join(process.cwd(), 'docs', 'MEMORY.md');

// READ: Physical MEMORY.md -> Database
export async function syncMemoryToVault() {
    try {
        if (!fs.existsSync(MEMORY_FILE_PATH)) {
            console.error("MEMORY.md not found at", MEMORY_FILE_PATH);
            return { error: 'MEMORY.md not found' };
        }

        const content = fs.readFileSync(MEMORY_FILE_PATH, 'utf-8');
        const supabase = await createClient();

        // 1. Ensure Project Exists (Redundant check if migration ran, but good for safety)
        const { error: projError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', CORE_PROJECT_ID)
            .single();

        if (projError && projError.code === 'PGRST116') {
            // Project missing, cannot sync. User needs to run migration.
            return { error: 'Core Project missing. Run migration 20251229_seed_hangar_core.sql' };
        }

        // 2. Upsert Document
        const { error: docError } = await supabase
            .from('documents')
            .upsert({
                project_id: CORE_PROJECT_ID,
                type: 'MEMORY_DUMP', // Special type for the raw dump
                title: 'System Memory (Physical)',
                content: content,
                updated_at: new Date().toISOString()
            }, { onConflict: 'project_id, type' });

        if (docError) throw docError;

        return { success: true, message: 'Memory Synced to Vault' };

    } catch (e) {
        console.error("Sync Error:", e);
        return { error: 'Failed to sync memory' };
    }
}

// WRITE: Database (Relay Summary) -> Physical MEMORY.md
// This appends the new Relay entry to the physical file.
export async function commitVaultToMemory(relayContent: string) {
    try {
        if (!fs.existsSync(MEMORY_FILE_PATH)) {
            return { error: 'MEMORY.md not found' };
        }

        const timestamp = new Date().toISOString();
        const appendBlock = `\n\n## System Update [${timestamp}]\n${relayContent}\n`;

        fs.appendFileSync(MEMORY_FILE_PATH, appendBlock);

        return { success: true, message: 'Vault Committed to Physical Memory' };

    } catch (e) {
        console.error("Commit Error:", e);
        return { error: 'Failed to commit to disk' };
    }
}
