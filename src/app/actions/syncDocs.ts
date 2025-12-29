"use server";

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

interface DocToSync {
    filename: string;
    content: string;
}

export async function syncDocsToDisk(docs: DocToSync[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check Role
    let isCivilian = true;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'COMMANDER') isCivilian = false;
    }

    // VIRTUAL PILLAR G (Civilians)
    if (isCivilian) {
        if (!user) return { success: false, error: "Unauthorized" };

        const { data: project } = await supabase.from('projects').select('id').eq('user_id', user.id).single();
        if (!project) return { success: false, error: "No Project Found" };

        const results = [];
        for (const doc of docs) {
            // Map filename to DocumentType best effort
            let type = 'TECH_SPEC';
            if (doc.filename.includes('PRD')) type = 'PRD';
            if (doc.filename.includes('STRATEGY')) type = 'STRATEGY';
            if (doc.filename.includes('DESIGN')) type = 'DESIGN';

            const { error } = await supabase.from('documents').upsert({
                project_id: project.id,
                type: type,
                title: doc.filename,
                content: doc.content,
                updated_at: new Date().toISOString()
            }); // Note: type cast might be needed if exact enum matches

            if (!error) results.push(`Synced (Virtual): ${doc.filename}`);
        }
        return { success: true, synced: results, logEntry: "Virtual Sync Complete" };
    }

    // PHYSICAL PILLAR G (Host)
    try {
        const docsDir = path.join(process.cwd(), 'docs');

        // Ensure docs dir exists (it should, but safety first)
        try {
            await fs.access(docsDir);
        } catch {
            await fs.mkdir(docsDir, { recursive: true });
        }

        const results = [];

        for (const doc of docs) {
            const filePath = path.join(docsDir, doc.filename);
            await fs.writeFile(filePath, doc.content, 'utf-8');
            results.push(`Synced: ${doc.filename}`);
        }

        // Append to SYNC_LOG.txt
        const logPath = path.join(docsDir, 'SYNC_LOG.txt');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] SYNC OPERATION:\n${results.map(r => `  - ${r}`).join('\n')}\n\n`;

        await fs.appendFile(logPath, logEntry, 'utf-8');

        return { success: true, synced: results, logEntry };
    } catch (e) {
        console.error("Sync Failed:", e);
        return { success: false, error: String(e) };
    }
}
