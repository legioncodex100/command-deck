"use server";

import fs from 'fs';
import path from 'path';

export async function scanForLayoutIssues(filePath: string) {
    try {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) return { valid: false, error: "File not found" };

        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        const violations: string[] = [];
        const suggestions: string[] = [];

        // Analysis Rules

        // 1. Screen Height Abuse (h-screen in nested components often causes cut-offs)
        if (content.includes('h-screen') && !filePath.includes('page.tsx') && !filePath.includes('layout.tsx')) {
            violations.push("Risk: `h-screen` usage detected in component.");
            suggestions.push("Replace `h-screen` with `h-full` to respect parent container boundaries.");
        }

        // 2. The "Flex Scroll" Trap (Missing min-h-0 or flex-1 in scroll containers)
        // Heuristic: Looking for overflow-auto inside a flex-col without explicitly constraining height
        if (content.includes('overflow-auto') && content.includes('flex-col') && !content.includes('min-h-0')) {
            violations.push("Risk: Flex Scroll Trap detected.");
            suggestions.push("Ensure scrolling flex children have `min-h-0` or `flex-1` to prevent expansion beyond parent.");
        }

        // 3. Dangerous Overflow Hiding
        if (content.includes('overflow-hidden') && !content.includes('rounded')) {
            // Often used for rounded corners, but if not, check context
            // This is a weak heuristic, so we'll phrase it as a warning
            violations.push("Warning: `overflow-hidden` detected.");
            suggestions.push("Verify this element allows scrolling if content expands. Consider `overflow-auto` for safety.");
        }

        // 4. Fixed Positioning Z-Index check
        if ((content.includes('fixed') || content.includes('absolute')) && !content.includes('z-')) {
            violations.push("Warning: Fixed/Absolute position without explicit Z-Index.");
            suggestions.push("Ensure layering is intentional by adding a `z-index` class.");
        }

        // 5. Component Name Extraction
        const componentRegex = /export\s+(?:default\s+)?(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/g;
        let match;
        const detectedComponents: string[] = [];
        while ((match = componentRegex.exec(content)) !== null) {
            detectedComponents.push(match[1]);
        }

        // Generate Fix Prompt
        const fixPrompt = violations.length > 0
            ? `Fix the following layout issues in ${path.basename(filePath)}:\n${violations.map(v => `- ${v}`).join('\n')}\n\nContext: The file contains components: ${detectedComponents.join(', ')}.`
            : null;

        return {
            valid: violations.length === 0,
            violations,
            suggestions: suggestions.length > 0 ? suggestions : ["Layout appears structurally sound."],
            detectedComponents,
            fixPrompt
        };

    } catch (e) {
        return { valid: false, error: "Scan failed" };
    }
}
