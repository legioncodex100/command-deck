Design Specification: Command Deck (Geist/Vercel Aesthetic)

1. Visual Language: "The Pilot's Cockpit"

The interface follows a high-precision, minimalist developer-tool aesthetic. It prioritizes data density, motion-free clarity, and high-contrast readability.

Core Palette (The "Zinc-Black" Scale)

Background: #000000 (Pure Black)

Surface: #09090b (Zinc-950)

Borders: #27272a (Zinc-800)

Text (Primary): #fafafa (Zinc-50)

Text (Secondary): #a1a1aa (Zinc-400)

Text (Muted): #3f3f46 (Zinc-600)

Accent (Action): #ffffff (Pure White)

Accent (Status): #10b981 (Emerald-500)

Accent (Warning): #f59e0b (Amber-500)

2. Layout Hierarchy

Every Pillar Studio must adhere to the 3-Column Cockpit structure:

Nav Rail (64px - 256px): Persistent sidebar with Zinc-800 right border.

Workbench (Center - Flexible): The primary execution area.

Intelligence Panel (Right - 450px): A fixed context-overlay for viewing artifacts (PRDs, Schemas) while working.

3. Component Tokens

Borders: All containers must use 1px solid var(--border-zinc-800).

Shadows: Shadows are strictly forbidden. Depth is created via 1px borders and subtle background shifts (bg-zinc-900/50).

Rounding: 6px (Tailwind rounded-md).

Typography:

Sans: Geist Sans or Inter (Tight tracking: -0.02em).

Mono: Geist Mono (Used for IDs, Code, and the Mission Mural).

4. Pillar-Specific UI Rules

Chat (Pillars A, I, J): Message logs use 1px horizontal dividers. No speech bubbles. User name labels are uppercase 9px font-black.

Vault (Dashboard): Artifact cards use #09090b backgrounds. Hover state triggers a border color shift to Zinc-500.

Terminals (Pillar C): Code blocks use a pure black background with Emerald-400 text.

5. Google Stitch Orchestration

When generating prompts for Stitch, the "Facade Architect" (Pillar H) must enforce these tokens:

--radius: 6px

--border-width: 1px

--primary: #ffffff

--background: #000000

6. Philosophy for Agents

Functional over Decorative: If a design element doesn't provide technical context, remove it.

Density: Avoid excessive whitespace; keep information compact but readable.

State: Every action must have a visual "Active" or "Loading" state using Zinc-800/900 transitions.