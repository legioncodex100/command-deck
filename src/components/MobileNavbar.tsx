"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Grid, Folder, X, Activity, Map } from 'lucide-react';
import { CommandDeckLogo } from '@/components/branding/CommandDeckLogo';
import {
    Search, CenterCircle, DataBase, ColorPalette, DataBlob,
    Construction, Integration, CertificateCheck, MachineLearningModel,
    Document, Calendar
} from "@carbon/icons-react";

const MENU_ITEMS = [
    { label: 'Discovery', href: '/discovery', icon: Search, letter: 'A' },
    { label: 'Strategy', href: '/strategy', icon: CenterCircle, letter: 'B' },
    { label: 'Substructure', href: '/substructure', icon: DataBase, letter: 'C' },
    { label: 'Design', href: '/design', icon: ColorPalette, letter: 'D' },
    { label: 'Planning', href: '/planning', icon: DataBlob, letter: 'E' },
    { label: 'Construction', href: '/construction', icon: Construction, letter: 'F' },
    { label: 'Integration', href: '/integration', icon: Integration, letter: 'G' },
    { label: 'Audit', href: '/audit', icon: CertificateCheck, letter: 'H' },
    { label: 'Memory', href: '/memory', icon: MachineLearningModel, letter: 'I' },
    { label: 'Docs', href: '/docs', icon: Document, letter: 'J' },
    { label: 'Chronology', href: '/chronology', icon: Calendar, letter: 'K' },
];

export function MobileNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const activeItem = MENU_ITEMS.find(item => pathname?.startsWith(item.href));

    const toggleRoadmap = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get('mobile_view') === 'roadmap') {
            params.delete('mobile_view');
        } else {
            params.set('mobile_view', 'roadmap');
            if (params.get('mobile_view') === 'artifacts') params.delete('mobile_view');
        }
        router.replace(`?${params.toString()}`);
    };

    const toggleArtifacts = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get('mobile_view') === 'artifacts') {
            params.delete('mobile_view');
        } else {
            params.set('mobile_view', 'artifacts');
            if (params.get('mobile_view') === 'roadmap') params.delete('mobile_view');
        }
        router.replace(`?${params.toString()}`);
    };

    return (
        <>
            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] h-16 bg-black/80 backdrop-blur-xl border-t border-zinc-800 lg:hidden flex items-center justify-between px-8 pb-1">

                {/* Left: Roadmap (Map) */}
                <button
                    onClick={toggleRoadmap}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                        searchParams.get('mobile_view') === 'roadmap' ? "text-emerald-400" : "text-zinc-500 hover:text-white"
                    )}
                >
                    <div className="relative">
                        <Map className="h-6 w-6" />
                    </div>
                </button>

                {/* Center: Menu (Ship Logo) */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex flex-col items-center justify-center -mt-6 h-14 w-14 bg-zinc-900 border border-zinc-700 rounded-full shadow-lg shadow-black/50 hover:bg-zinc-800 transition-all overflow-hidden p-3"
                >
                    <CommandDeckLogo showText={false} className="w-full h-full text-emerald-500" />
                </button>

                {/* Right: Artifacts (Activity) */}
                <button
                    onClick={toggleArtifacts}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                        searchParams.get('mobile_view') === 'artifacts' ? "text-emerald-400" : "text-zinc-500 hover:text-white"
                    )}
                >
                    <Activity className="h-6 w-6" />
                </button>

            </div>

            {/* Full Screen Menu Drawer */}
            <div className={cn(
                "fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl transform transition-transform duration-300 flex flex-col",
                isMenuOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <span className="text-xl font-bold tracking-widest text-emerald-500">COMMAND DECK</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 place-content-start">
                    {MENU_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all aspect-square",
                                pathname?.startsWith(item.href)
                                    ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:border-zinc-700 hover:text-zinc-300"
                            )}
                        >
                            <item.icon className="h-8 w-8" />
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-xs font-bold">{item.letter}</span>
                                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                            </div>
                        </Link>
                    ))}

                    {/* Dashboard/Home Link in Grid */}
                    <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
                    >
                        <Home className="h-5 w-5" />
                        <span className="font-bold tracking-wider">DASHBOARD</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
