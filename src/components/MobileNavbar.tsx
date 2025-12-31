"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Zap, Map, FileText, Clipboard, ClipboardCheck, Palette, Eye, Activity, X, Settings, LogOut, Rocket, ChevronDown, Plus, Folder, Check, GitBranch, Layout, Bot, Smartphone, Users, Cpu, UserPlus, Shield } from 'lucide-react';
import { CommandDeckLogo } from '@/components/branding/CommandDeckLogo';
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/services/supabase";
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

const HANGAR_ITEMS = [
    { label: 'Evolution Lab', href: '/hangar', icon: GitBranch, letter: 'E' },
    { label: 'Flight Deck', href: '/hangar/flight', icon: Layout, letter: 'F' },
    { label: 'Synthetic Div', href: '/hangar/ai', icon: Bot, letter: 'S' },
    { label: 'Device Sim', href: '/hangar/simulator', icon: Smartphone, letter: 'D' },
    { label: 'Civilian Registry', href: '/hangar/civilians', icon: Users, letter: 'C' },
    { label: 'Maintenance', href: '/hangar/maintenance', icon: Activity, letter: 'M' },
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
    },
    '/hangar/ai/': {
        left: { icon: Eye, label: 'Visuals' },
        right: { icon: Cpu, label: 'Core' }
    },
    '/hangar/civilians': {
        left: { icon: UserPlus, label: 'Invite' },
        right: { icon: Shield, label: 'Stats' }
    },
    '/hangar/flight': {
        left: { icon: Layout, label: 'Backlog' },
        right: { icon: ClipboardCheck, label: 'Log' }
    }
};

interface MobileNavbarProps {
    mode?: 'deck' | 'hangar';
}

export function MobileNavbar({ mode = 'deck' }: MobileNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Swipe handlers
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };

    const onTouchEnd = () => {
        if (!touchStart || (!touchEnd && touchEnd !== 0)) return;
        const distance = touchStart - touchEnd;
        const isDownSwipe = distance < -50;
        if (isDownSwipe) {
            setIsMenuOpen(false);
        }
    };

    // Auth & Profile Logic
    const { signOut, user } = useAuth();
    const { projects, activeProject, createProject, switchProject, isLoading } = useProject();
    const [profile, setProfile] = useState<{ display_name: string, full_name: string, role: string, avatar_url: string | null } | null>(null);

    // Project Switcher State
    const [isProjectExpanded, setIsProjectExpanded] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        await createProject(newProjectName.trim());
        setNewProjectName("");
        setIsCreatingProject(false);
        setIsProjectExpanded(false);
        setIsMenuOpen(false);
        router.push('/dashboard');
    };

    useEffect(() => {
        if (user) {
            supabase.from('profiles').select('*').eq('id', user.id).single()
                .then(({ data }) => {
                    if (data) {
                        setProfile(data);
                    }
                    if (!data?.avatar_url && user.user_metadata?.avatar_url) {
                        setProfile(prev => prev ? ({ ...prev, avatar_url: user.user_metadata.avatar_url }) : ({ display_name: '', full_name: '', role: 'OPERATIVE', avatar_url: user.user_metadata.avatar_url }));
                    }
                });
        } else {
            setProfile(null);
        }
    }, [user]);

    // Get current config based on path prefix
    // Get current config based on path prefix - prioritize longest match
    const activePillarConfig = Object.entries(PILLAR_CONFIG)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([path]) => pathname?.startsWith(path))?.[1];
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

                    {/* Project Switcher (Hidden in Hangar Mode for simplicity, or keep? keeping for now) */}
                    {/* Actually, let's keep it. Admins might want to switch context even in Hangar. */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setIsProjectExpanded(!isProjectExpanded)}
                            className="w-full flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-zinc-900 text-emerald-500 flex items-center justify-center shrink-0 font-bold border border-zinc-800">
                                    {isLoading ? "..." : (activeProject?.name.substring(0, 1) || "+")}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Active Project</span>
                                    <span className="text-sm font-bold text-zinc-200">{activeProject?.name || "Select Project"}</span>
                                </div>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform duration-300", isProjectExpanded && "rotate-180")} />
                        </button>

                        {/* Expandable Project List */}
                        <div className={cn(
                            "grid transition-all duration-300 ease-in-out bg-zinc-950/50",
                            isProjectExpanded ? "grid-rows-[1fr] border-t border-zinc-800" : "grid-rows-[0fr]"
                        )}>
                            <div className="overflow-hidden">
                                <div className="p-2 space-y-1">
                                    {projects.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { switchProject(p.id); setIsProjectExpanded(false); setIsMenuOpen(false); router.push('/dashboard'); }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                                                activeProject?.id === p.id
                                                    ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/20"
                                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Folder className="h-4 w-4" />
                                                <span>{p.name}</span>
                                            </div>
                                            {activeProject?.id === p.id && <Check className="h-3 w-3" />}
                                        </button>
                                    ))}

                                    <div className="h-px bg-zinc-800 my-2" />

                                    {isCreatingProject ? (
                                        <div className="flex items-center gap-2 p-1 animate-in fade-in slide-in-from-left-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="New Project Name..."
                                                className="flex-1 bg-zinc-900 border border-emerald-500/50 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                                value={newProjectName}
                                                onChange={(e) => setNewProjectName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCreateProject();
                                                    if (e.key === 'Escape') setIsCreatingProject(false);
                                                }}
                                            />
                                            <button
                                                onClick={handleCreateProject}
                                                className="p-2 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 border border-emerald-500/20"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsCreatingProject(true)}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Create New Project</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links (Mode Switched) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                {mode === 'hangar' ? 'Hangar Protocols' : 'Mission Pillars'}
                            </span>
                        </div>

                        {/* Top Link (Dashboard or Exit Hangar) */}
                        <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-bold tracking-wider text-xs uppercase mb-3",
                                mode === 'hangar'
                                    ? "bg-red-950/10 border-red-900/30 text-red-500 hover:bg-red-950/20"
                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}
                        >
                            {mode === 'hangar' ? <LogOut className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                            <span>{mode === 'hangar' ? 'Exit to Deck' : 'Mission Hub'}</span>
                        </Link>

                        {/* Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {(mode === 'hangar' ? HANGAR_ITEMS : PILLAR_ITEMS).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all aspect-square",
                                        (item.href === '/hangar' ? pathname === item.href : pathname?.startsWith(item.href))
                                            ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
                                            : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:border-zinc-700 hover:text-zinc-300"
                                    )}
                                >
                                    <span className="text-xs font-bold text-current mb-0.5 opacity-50">{item.letter}</span>
                                    <item.icon className="h-6 w-6 mb-1" />
                                    <span className="text-[9px] font-medium uppercase tracking-wider opacity-80 text-center leading-tight">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Ship Systems (Show only in Deck mode, or specific Hangar logic?) */}
                    {/* Let's show Ship Systems in Deck mode only for now, to keep Hangar clean or add specific ones later */}
                    {mode === 'deck' && (
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
                                            "flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all aspect-square",
                                            pathname?.startsWith(item.href)
                                                ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
                                                : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:border-zinc-700 hover:text-zinc-300"
                                        )}
                                    >
                                        <span className="text-xs font-bold text-current mb-0.5 opacity-50">{item.letter}</span>
                                        <item.icon className="h-6 w-6 mb-1" />
                                        <span className="text-[9px] font-medium uppercase tracking-wider opacity-80 text-center leading-tight">{item.label}</span>
                                    </Link>
                                ))}

                                {/* Admin Hangar Link */}
                                {(user?.email === 'mohammed@legiongrappling.com' || profile?.role === 'ADMIN') && (
                                    <Link
                                        href="/hangar"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="col-span-full flex items-center justify-center gap-2 p-3 rounded-xl border border-indigo-900/30 bg-indigo-950/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20 transition-all font-bold tracking-wider text-xs uppercase"
                                    >
                                        <Rocket className="h-4 w-4" />
                                        <span>Hangar Protocol</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* User & Settings */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Personnel</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/20 mb-2">
                                <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                                    {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                                        <img
                                            src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                                            alt="User"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-emerald-900/20 flex items-center justify-center text-emerald-500 font-bold">
                                            {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-zinc-200">
                                            {profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || 'User'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{profile?.role || 'Crew Member'}</span>

                                    {/* Codename Badge */}
                                    {profile?.display_name && profile?.display_name !== profile?.full_name && (
                                        <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-wider mt-0.5">
                                            {profile.full_name}
                                        </span>
                                    )}
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

