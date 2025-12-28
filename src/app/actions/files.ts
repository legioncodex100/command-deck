"use server";

import fs from 'fs';
import path from 'path';

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
    if (process.env.NODE_ENV === 'production') {
        console.warn("File writes disabled in production.");
        return { success: false, message: "Use local dev only." };
    }

    try {
        const filePath = path.join(process.cwd(), 'docs', 'ARCHITECTURE.md');

        // Append or Replace? Let's Append a new section for the Substructure
        // Or maybe replace the "Database Schema" section? 
        // For MVP simplicity, we will append it as a "Latest Schema Snapshot".

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
