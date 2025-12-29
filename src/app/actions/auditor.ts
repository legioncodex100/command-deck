"use server";

import fs from 'fs';
import path from 'path';

/**
 * Scans a file for Strict Layer Separation (SLS) violations.
 * - Prohibited: Direct database calls (useEffect + supabase), large files.
 */
export async function scanFileForSLS(filePath: string) {
    try {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

        if (!fs.existsSync(fullPath)) {
            return { error: "File not found" };
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        const violations: string[] = [];

        // 1. Check File Length
        if (lines.length > 150) {
            violations.push(`Violation: File length (${lines.length} lines) exceeds 150-line limit.`);
        }

        // 2. Check for prohibited DB patterns in UI components
        // (Crude regex check: looking for 'supabase.from' inside typical React component files)
        if (filePath.includes('/components/') && content.includes('supabase.from')) {
            // Basic check: is it inside a useEffect?
            if (content.match(/useEffect[\s\S]*supabase\.from/)) {
                violations.push("Violation: Direct Supabase call detected inside useEffect. Use a Service Layer.");
            }
        }

        return {
            valid: violations.length === 0,
            violations,
            lineCount: lines.length
        };

    } catch (error) {
        return { error: "Failed to scan file" };
    }
}

/**
 * Returns the line count of a specific file.
 */
export async function getFileLineCount(filePath: string) {
    try {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) return 0;

        const content = fs.readFileSync(fullPath, 'utf-8');
        return content.split('\n').length;
    } catch (error) {
        return 0;
    }
}

/**
 * Reads the Master Specification file to display in the Debug Context Inspector.
 */
export async function readMasterSpec() {
    try {
        const fullPath = path.join(process.cwd(), 'docs/MASTER_SPECIFICATION.md');
        if (!fs.existsSync(fullPath)) return "Master Spec not found on disk.";
        return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
        return "Error reading Master Spec.";
    }
}
