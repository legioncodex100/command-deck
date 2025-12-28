"use client";

import { useProject } from "@/hooks/useProject";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ROUTE_NAMES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/discovery': 'Discovery Lab',
    '/strategy': 'Strategy Room',
    '/planning': 'Planning Hub',
    '/substructure': 'Substructure',
    '/facade': 'Design Studio',
    '/construction': 'Construction',
    '/integration': 'Integration',
    '/audit': 'Auditor Lab',
    '/memory': 'Context Bridge',
    '/docs': 'Doc Engine',
    '/chronology': 'Mission Mural'
};

export function GlobalHeader() {
    const { activeProject } = useProject();
    const pathname = usePathname();

    const currentPage = ROUTE_NAMES[pathname] || pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';

    // Capitalize first letter if falling back to raw path
    const formattedPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <header className="flex flex-col gap-1 mb-6 border-b border-zinc-800/50 pb-4 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Command Deck <span className="text-zinc-700">/</span> {formattedPage}
            </div>
            <div className="flex items-baseline justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    {formattedPage}
                </h1>
                <p className="text-emerald-500 font-mono text-xs flex items-center gap-2 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {activeProject?.name || "No Active Project"}
                </p>
            </div>
        </header>
    );
}
