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
    Users, // Civilians
    Bot // AI Crew
} from 'lucide-react';

const HANGAR_ITEMS = [
    { label: 'Evolution Lab', href: '/hangar', icon: GitBranch }, // Default view
    { label: 'Flight Deck', href: '/hangar/flight', icon: Layout },
    { label: 'Synthetic Division', href: '/hangar/ai', icon: Bot },
    { label: 'Civilian Registry', href: '/hangar/civilians', icon: Users },
    { label: 'Maintenance Bay', href: '/hangar/maintenance', icon: Activity },
];

export function HangarSidebar() {
    const pathname = usePathname();
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Fetch commander avatar - could be optimized but direct fetch is safe here
        // We know only commander access here, so user ID check is implied by layout
        const fetchAvatar = async () => {
            const { data: { user } } = await import("@/services/supabase").then(m => m.supabase.auth.getUser());
            if (user) {
                const { data } = await import("@/services/supabase").then(m => m.supabase.from('profiles').select('avatar_url').eq('id', user.id).single());
                if (data?.avatar_url) setAvatarUrl(data.avatar_url);
                else if (user.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
            }
        };
        fetchAvatar();
    }, []);

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
            <div className="p-2 border-t border-[#1a1a1a] flex flex-col gap-2">
                {/* Commander Avatar */}
                <div className="flex items-center gap-3 px-2 py-1 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 shrink-0 overflow-hidden relative flex items-center justify-center">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Commander" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-bold text-zinc-500">CMD</span>
                        )}
                    </div>
                    <div className="hidden group-hover:flex flex-col animate-in fade-in slide-in-from-left-2 whitespace-nowrap overflow-hidden">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Commander</span>
                        <span className="text-[10px] text-zinc-600 truncate">mohammed@legion...</span>
                    </div>
                </div>

                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/10 transition-all group/exit"
                >
                    <LogOut className="h-4 w-4 group-hover/exit:rotate-180 transition-transform shrink-0" />
                    <span className="hidden group-hover:block animate-in fade-in slide-in-from-left-2 whitespace-nowrap">Disconnect (Exit)</span>
                </Link>
            </div>
        </aside>
    );
}
