"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Zap, Map, FileText, Clipboard, ClipboardCheck, Palette, Eye, Activity, X, Settings, LogOut } from 'lucide-react';
import { CommandDeckLogo } from '@/components/branding/CommandDeckLogo';
import {
    Search, CenterCircle, DataBase, ColorPalette, DataBlob,
    Construction, Integration, CertificateCheck, MachineLearningModel,
    Document, Calendar
} from "@carbon/icons-react";

// --- Configuration ---

const SYSTEM_ITEMS = [
    { label: 'Audit', href: '/audit', icon: CertificateCheck, letter: 'H' },
    { label: 'Memory', href: '/memory', icon: MachineLearningModel, letter: 'I' },
    { label: 'Docs', href: '/docs', icon: Document, letter: 'J' },
    { label: 'Chronology', href: '/chronology', icon: Calendar, letter: 'K' },
];

const PILLAR_ITEMS = [
    { label: 'Discovery', href: '/discovery', icon: Search, letter: 'A' },
    { label: 'Strategy', href: '/strategy', icon: CenterCircle, letter: 'B' },
    { label: 'Substructure', href: '/substructure', icon: DataBase, letter: 'C' },
    { label: 'Design', href: '/design', icon: ColorPalette, letter: 'D' },
    { label: 'Planning', href: '/planning', icon: DataBlob, letter: 'E' },
    { label: 'Construction', href: '/construction', icon: Construction, letter: 'F' },
    { label: 'Integration', href: '/integration', icon: Integration, letter: 'G' },
];

// Context-Aware Config (The Chameleon Bar)
const PILLAR_CONFIG: Record<string, { left: { icon: any, label: string }, right: { icon: any, label: string } }> = {
    '/discovery': {
        left: { icon: Map, label: 'Roadmap' },
        right: { icon: FileText, label: 'PRD' }
    },
    '/strategy': {
        left: { icon: Clipboard, label: 'Briefing' },
        right: { icon: Zap, label: 'Decisions' }
    },
    '/substructure': {
        left: { icon: DataBase, label: 'Schema' },
        right: { icon: FileText, label: 'Policies' }
    },
    '/design': {
        left: { icon: Palette, label: 'Systems' },
        right: { icon: Eye, label: 'Preview' }
    },
    '/planning': {
        left: { icon: DataBlob, label: 'Backlog' },
        right: { icon: Activity, label: 'Sprints' }
    },
    '/construction': {
        left: { icon: ClipboardCheck, label: 'Kanban' },
        right: { icon: FileText, label: 'Orders' }
    },
    '/integration': {
        left: { icon: Activity, label: 'Tests' },
        right: { icon: FileText, label: 'Logs' }
    }
};

export function MobileNavbar({ userProfile, userData }: { userProfile?: any, userData?: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get current config based on path prefix
    const activePillarConfig = Object.entries(PILLAR_CONFIG).find(([path]) => pathname?.startsWith(path))?.[1];
    const isPillarPage = !!activePillarConfig;

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
            {/* Bottom Bar (The Chameleon Bar) */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] h-20 pb-4 bg-black/90 backdrop-blur-xl border-t border-zinc-800 lg:hidden flex items-center justify-between px-8">

                {/* Left Action (Context) */}
                {isPillarPage && activePillarConfig ? (
                    <button
                        onClick={toggleRoadmap}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all active:scale-95",
                            searchParams.get('mobile_view') === 'roadmap' ? "text-emerald-400" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <activePillarConfig.left.icon className="h-6 w-6" />
                        <span className="text-[9px] font-medium uppercase tracking-wider">{activePillarConfig.left.label}</span>
                    </button>
                ) : (
                    <div className="w-12" />
                )}

                {/* Center: Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex flex-col items-center justify-center -mt-8 h-16 w-16 bg-zinc-900 border border-zinc-700 rounded-full shadow-lg shadow-black/50 hover:bg-zinc-800 transition-all active:scale-90"
                >
                    <CommandDeckLogo showText={false} className="w-full h-full text-emerald-500 p-3.5" />
                </button>

                {/* Right Action (Tools) */}
                {isPillarPage && activePillarConfig ? (
                    <button
                        onClick={toggleArtifacts}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all active:scale-95",
                            searchParams.get('mobile_view') === 'artifacts' ? "text-emerald-400" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <activePillarConfig.right.icon className="h-6 w-6" />
                        <span className="text-[9px] font-medium uppercase tracking-wider">{activePillarConfig.right.label}</span>
                    </button>
                ) : (
                    <div className="w-12" />
                )}

            </div>

            {/* Backdrop */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Bottom Sheet Menu (The Hangar Bay) */}
            <div className={cn(
                "fixed inset-x-0 bottom-0 z-[80] bg-[#09090b] border-t border-zinc-800 rounded-t-3xl transform transition-transform duration-300 ease-out flex flex-col h-[75vh]",
                isMenuOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-widest text-emerald-500 uppercase">Command Deck</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-zinc-900/50 rounded-full text-zinc-500 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-5xl mx-auto w-full">

                    {/* Primary Pillars Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Mission Pillars</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {PILLAR_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all aspect-square",
                                        pathname?.startsWith(item.href)
                                            ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
                                            : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:border-zinc-700 hover:text-zinc-300"
                                    )}
                                >
                                    <span className="text-xs font-bold text-current mb-0.5">{item.letter}</span>
                                    <item.icon className="h-6 w-6 mb-1" />
                                    <span className="text-[9px] font-medium uppercase tracking-wider opacity-80">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Ship Systems (Horizontal Scroll) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Ship Systems</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {SYSTEM_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-2.5 p-3 rounded-xl border transition-all",
                                        pathname?.startsWith(item.href)
                                            ? "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
                                            : "bg-zinc-900/20 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                </Link>
                            ))}
                            {/* Dashboard Home */}
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className="col-span-full flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-bold tracking-wider text-xs uppercase"
                            >
                                <Home className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </div>
                    </div>

                    {/* User & Settings */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Personnel</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/20 mb-2">
                                <div className="h-10 w-10 rounded-full bg-emerald-900/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <span className="font-bold">{userProfile?.full_name?.[0] || 'U'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-zinc-200">{userProfile?.full_name || 'User'}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{userProfile?.role || 'Crew Member'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="/settings"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-bold tracking-wider text-xs uppercase"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                                <button
                                    onClick={async () => {
                                        await signOut();
                                        router.refresh();
                                    }}
                                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-800 bg-red-950/10 text-red-400 hover:bg-red-950/20 transition-all font-bold tracking-wider text-xs uppercase"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
