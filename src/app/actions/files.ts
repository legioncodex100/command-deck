"use server";

import fs from 'fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

const IS_HOST = process.env.NODE_ENV !== 'production'; // Simplistic check for now, ideally check auth role

export async function updateInstructionsFile(content: string) {
    if (process.env.NODE_ENV === 'production') {
        console.warn("File writes disabled in production.");
        return { success: false, message: "Use local dev only." };
    }

    try {
        const filePath = path.join(process.cwd(), 'docs', 'INSTRUCTIONS.md');
        // Replace implementation section or append? The user said "specifically the implementation section".
        // For simplicity/robustness in MVP, we will PREPEND a "Next Mission" section block 
        // to make it the first thing the agent sees, or just overwrite the file if that's the "Work Order".
        // The spec implies this file drives the agent. Let's overwrite safely or append a clear directive.

        // Let's Append a high priority directive.
        const timestamp = new Date().toISOString();
        const directive = `\n\n# PRIORITY MISSION (${timestamp})\n\n${content}\n\n---`;

        fs.appendFileSync(filePath, directive);

        return { success: true };
    } catch (error) {
        console.error("File write error:", error);
        return { success: false, message: "Failed to write file." };
    }
}

export async function updateArchitectureFile(content: string) {
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
        if (!user) return { success: false, message: "Unauthorized" };

        // Find their project (Assume single project for MVP or pass project_id)
        const { data: project } = await supabase.from('projects').select('id').eq('user_id', user.id).single();
        if (!project) return { success: false, message: "No Project Found" };

        const timestamp = new Date().toISOString();
        const newContent = `\n\n## Substructure Snapshot (${timestamp})\n\`\`\`sql\n${content}\n\`\`\``;

        // Upsert to 'documents' table
        const { error } = await supabase.from('documents').upsert({
            project_id: project.id,
            type: 'SCHEMA', // We treat Architecture updates as Schema/Tech Spec updates
            title: 'Architecture Snapshot',
            content: newContent, // Note: This overwrites or we need to append logic. For DB, usually we keep latest version.
            updated_at: timestamp
        });

        if (error) return { success: false, message: error.message };
        return { success: true };
    }

    // PHYSICAL PILLAR G (Host)
    if (process.env.NODE_ENV === 'production') {
        console.warn("File writes disabled in production.");
        return { success: false, message: "Use local dev only." };
    }

    try {
        const filePath = path.join(process.cwd(), 'docs', 'ARCHITECTURE.md');
        const timestamp = new Date().toISOString();
        const newContent = `\n\n## Substructure Snapshot (${timestamp})\n\`\`\`sql\n${content}\n\`\`\``;

        fs.appendFileSync(filePath, newContent);

        return { success: true };
    } catch (error) {
        console.error("File write error:", error);
        return { success: false, message: "Failed to write file." };
    }
}

export async function updateMemoryFile(content: string) {
    if (process.env.NODE_ENV === 'production') {
        return { success: false, message: "Use local dev only." };
    }

    try {
        const filePath = path.join(process.cwd(), 'docs', 'MEMORY.md');
        const timestamp = new Date().toISOString();
        const entry = `\n\n## Session Log (${timestamp})\n${content}`;

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.appendFileSync(filePath, entry);
        return { success: true };
    } catch (error) {
        console.error("Memory write error:", error);
        return { success: false, message: "Failed to write memory." };
    }
}

export async function updateDocsFolder(files: { name: string, content: string }[]) {
    if (process.env.NODE_ENV === 'production') {
        return { success: false, message: "Use local dev only." };
    }

    try {
        const docsDir = path.join(process.cwd(), 'docs');
        if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

        for (const file of files) {
            // sanitize filename to avoid path traversal
            const safeName = path.basename(file.name);
            const filePath = path.join(docsDir, safeName);
            fs.writeFileSync(filePath, file.content);
        }
        return { success: true };
    } catch (error) {
        console.error("Docs write error:", error);
        return { success: false, message: "Failed to write docs." };
    }
}
