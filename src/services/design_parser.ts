
export function parseDesignResources(markdown: string) {
    const resources = {
        colors: [] as { name: string, value: string }[],
        typography: [] as { name: string, value: string }[]
    };

    if (!markdown) return resources;

    // Extract Hex Colors (Simple regex for 6 digit hex codes)
    const colorRegex = /(?:^|\s)(#[0-9a-fA-F]{6})(?:\s|$)/g;
    const colorMatches = markdown.match(colorRegex);
    if (colorMatches) {
        // Deduplicate and format
        const uniqueColors = Array.from(new Set(colorMatches.map(c => c.trim())));
        resources.colors = uniqueColors.slice(0, 5).map(c => ({ name: 'Color Token', value: c }));
    }

    // Attempt to find Color Palette sections specifically
    // Look for lines like "- Primary: #000000" or "**Surface**: #121212"
    const paletteLines = markdown.match(/^[-*]\s*(\*\*?[a-zA-Z0-9\s]+\*\*?|.*?):\s*(#[0-9a-fA-F]{6})/gm);
    if (paletteLines) {
        resources.colors = paletteLines.map(line => {
            const parts = line.split(':');
            const name = parts[0].replace(/[-*]/g, '').trim();
            const value = parts[1].trim();
            return { name, value };
        }).slice(0, 8); // Limit to 8
    }

    // Extract Fonts
    // Look for "Font Family: Inter" or similar patterns
    const fontRegex = /(?:Font Family|Typography|Typeface):\s*([a-zA-Z\s,"'-]+)/i;
    const fontMatch = markdown.match(fontRegex);
    if (fontMatch) {
        resources.typography.push({ name: 'Primary Font', value: fontMatch[1].trim() });
    }

    // Look for specific font mentions in standard markdown lists e.g. "- Heading Font: X"
    const fontLines = markdown.match(/^[-*]\s*(?:Heading|Body|Mono|Serif|Sans)\s*(?:Font)?:?\s*([a-zA-Z\s,"'-]+)/gmi);
    if (fontLines) {
        resources.typography = fontLines.map(line => {
            const parts = line.split(':');
            const name = parts[0].replace(/[-*]/g, '').trim();
            // If no colon, might be just "- Inter (Sans)"
            const value = parts[1] ? parts[1].trim() : parts[0].trim();
            return { name, value };
        });
    }

    return resources;
}
