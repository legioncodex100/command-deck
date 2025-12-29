# Command Deck: Emerald Design System

> **Source Truth**: Based on the visual analysis of `src/app/discovery/page.tsx`.
> **Purpose**: To enforce a unified "Dark Void" aesthetic across all application screens.

## 1. Core Palette

| Token | Class | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Void BG** | `bg-[#020402]` | `#020402` | Main page background, Card backgrounds. |
| **Deep Zinc** | `bg-zinc-950` | `#09090b` | Modals, Dropdowns, Secondary panels. |
| **Black** | `bg-black` | `#000000` | Terminal windows, Code editors, Contrast areas. |
| **Emerald Accent** | `text-emerald-500` | `#10b981` | Icons, Primary Actions, Active States. |
| **Emerald Glow** | `shadow-emerald-900/10` | - | Subtle ambient glow on active cards. |

## 2. Borders & Separation

*   **Primary Border**: `border border-emerald-500/20`
    *   *Use for:* Active cards, inputs, primary structural containers.
*   **Subtle Border**: `border border-zinc-800`
    *   *Use for:* Dividers, inactive panels, structural scaffolding.
*   **Interactive Border**: `hover:border-emerald-500/50`
    *   *Use for:* Clickable cards, inputs on focus.

## 3. Typography (Geist Mono)

*   **Metadata Labels**:
    *   `text-[10px] font-bold uppercase tracking-widest text-emerald-500/80`
    *   *Example:* "ANALYST BANDWIDTH", "LIVE ARTIFACT".
*   **Body Text**:
    *   `text-sm font-mono leading-relaxed text-emerald-50/90`
    *   *Example:* Chat messages, content blocks.
*   **Subtle/Ghost Text**:
    *   `text-xs text-zinc-500 font-mono`
    *   *Example:* Placeholders, timestamps, empty states.

## 4. Components & UI Patterns

### The "Command Card"
Standard container for tools and lists.
```tsx
<div className="p-3 bg-[#020402] border border-emerald-500/20 rounded-md shadow-sm shadow-emerald-900/5">
  {/* Content */}
</div>
```

### The "Terminal Header"
Used for panels requiring technical labeling.
```tsx
<div className="flex border-b border-emerald-500/20 bg-zinc-950/50 backdrop-blur-sm p-3">
  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
    <Icon className="h-3 w-3" /> TITLE
  </span>
</div>
```

### Primary Action Button
```tsx
<button className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-sm transition-all">
  Action Name
</button>
```

### Secondary/Ghost Button
```tsx
<button className="bg-transparent border border-zinc-800 hover:border-emerald-500/50 text-zinc-500 hover:text-emerald-400 text-xs uppercase tracking-wider px-3 py-2 rounded-sm transition-all">
  Cancel / Secondary
</button>
```

## 5. Animation & Decorators

*   **Pulse Status**: `<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />`
*   **Glass Panel**: `backdrop-blur-sm bg-zinc-950/80`

## 6. Layout Physics (Critical)

> **The "Infinite Scroll" Bug**: In CSS Grid, flex children default to `min-height: auto`. This means they expand to fit content rather than shrinking to fit the parent container, breaking scrollbars.

**Rule 1: The Constraint Layer**
Every direct child of a main 12-column grid MUST have `overflow-hidden`.
```tsx
<div className="col-span-4 ... overflow-hidden flex flex-col">
   {/* This forces the header + scrollable content to fit the viewport height */}
</div>
```

**Rule 2: The Scrollable Core**
The inner scrolling container must be `flex-1` and `overflow-y-auto`.
```tsx
<div className="flex-1 overflow-y-auto ... custom-scrollbar">
  {/* Long content here */}
</div>
```

**Rule 3: Height Propagation**
The root container must have `h-full` (and the parent chain in `layout.tsx` must propagate 100vh).
