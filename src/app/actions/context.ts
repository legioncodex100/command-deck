"use server";

import fs from 'fs/promises';
import path from 'path';

export async function getSystemContext() {
    try {
        const docsDir = path.join(process.cwd(), 'docs');

        const [memory, architecture, masterSpec] = await Promise.all([
            fs.readFile(path.join(docsDir, 'MEMORY.md'), 'utf-8').catch(() => "MEMORY.md not found."),
            fs.readFile(path.join(docsDir, 'ARCHITECTURE.md'), 'utf-8').catch(() => "ARCHITECTURE.md not found."),
            fs.readFile(path.join(docsDir, 'MASTER_SPECIFICATION.md'), 'utf-8').catch(() => "MASTER_SPECIFICATION.md not found.")
        ]);

        return {
            memory,
            architecture,
            masterSpec
        };
    } catch (error) {
        console.error("Error reading system context:", error);
        return {
            memory: "Error loading memory.",
            architecture: "Error loading architecture.",
            masterSpec: "Error loading spec."
        };
    }
}
