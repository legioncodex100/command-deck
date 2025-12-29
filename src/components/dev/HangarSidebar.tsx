"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    GitBranch, // Evolution
    Layout, // Flight Deck (Project Board)
    Activity, // Maintenance
    LogOut, // Exit
    Terminal,
    Users // Civilians
} from 'lucide-react';

const HANGAR_ITEMS = [
    { label: 'Evolution Lab', href: '/hangar', icon: GitBranch }, // Default view
    { label: 'Flight Deck', href: '/hangar/flight', icon: Layout },
    { label: 'Civilian Registry', href: '/hangar/civilians', icon: Users },
    { label: 'Maintenance Bay', href: '/hangar/maintenance', icon: Activity },
];

export function HangarSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-[56px] z-40 h-[calc(100vh-56px)] w-16 hover:w-64 transition-all duration-300 bg-[#050505] border-r border-[#1a1a1a] flex flex-col font-mono group overflow-visible">
            {/* Navigation */}
            <nav className="flex-1 p-2 flex flex-col gap-1 mt-2">
                <div className="px-2 py-2 text-[10px] uppercase font-bold text-zinc-700 tracking-widest hidden group-hover:block animate-in fade-in slide-in-from-left-2 whitespace-nowrap">
                    Governance Zones
                </div>
                {HANGAR_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all",
                                isActive
                                    ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/20"
                                    : "text-zinc-500 hover:text-emerald-300 hover:bg-emerald-950/10 border border-transparent"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="hidden group-hover:block animate-in fade-in slide-in-from-left-2 whitespace-nowrap">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Exit */}
            <div className="p-2 border-t border-[#1a1a1a]">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/10 transition-all group"
                >
                    <LogOut className="h-4 w-4 group-hover:rotate-180 transition-transform shrink-0" />
                    <span className="hidden group-hover:block animate-in fade-in slide-in-from-left-2 whitespace-nowrap">Disconnect (Exit)</span>
                </Link>
            </div>
        </aside>
    );
}
