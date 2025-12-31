"use client";

import Link from "next/link";
import {
    Dashboard, CertificateCheck, DataBase, Construction,
    Search, ColorPalette, Document, MachineLearningModel,
    Integration, CenterCircle, DataBlob, Calendar,
    ChevronDown, Add, Folder
} from "@carbon/icons-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useState, useEffect } from "react";
import { Stage } from "@/types/database";
import { useRouter, usePathname } from "next/navigation";
import { ProjectManagerModal } from "@/components/ProjectManagerModal";
import { Settings, LogIn, LogOut, Rocket, User as UserIcon } from "lucide-react";
import { supabase } from "@/services/supabase";

// 11 Pillars of the Command Deck
type Pillar = {
    letter: string;
    label: string;
    href: string;
    icon: any;
    stage: Stage | string; // Allow flexible stages
};

const PILLARS: Pillar[] = [
    { letter: 'A', label: 'Discovery Lab', href: '/discovery', icon: Search, stage: 'DISCOVERY' },
    { letter: 'B', label: 'Strategy Room', href: '/strategy', icon: CenterCircle, stage: 'STRATEGY' },
    { letter: 'C', label: 'Substructure', href: '/substructure', icon: DataBase, stage: 'SUBSTRUCTURE' },
    { letter: 'D', label: 'Design Studio', href: '/design', icon: ColorPalette, stage: 'DESIGN' },
    { letter: 'E', label: 'Planning Hub', href: '/planning', icon: DataBlob, stage: 'PLANNING' },
    { letter: 'F', label: 'Construction', href: '/construction', icon: Construction, stage: 'CONSTRUCTION' },
    { letter: 'G', label: 'Integration', href: '/integration', icon: Integration, stage: 'INTEGRATION' },
    { letter: 'H', label: 'Auditor Lab', href: '/audit', icon: CertificateCheck, stage: 'AUDIT' },
    { letter: 'I', label: 'Context Bridge', href: '/memory', icon: MachineLearningModel, stage: 'MEMORY' },
    { letter: 'J', label: 'Doc Engine', href: '/docs', icon: Document, stage: 'HANDOVER' },
    { letter: 'K', label: 'Mission Mural', href: '/chronology', icon: Calendar, stage: 'CHRONOLOGY' },
];

export function Sidebar() {
    const { signOut, user } = useAuth();
    const { projects, activeProject, createProject, switchProject, isLoading } = useProject();
    const router = useRouter();
    const pathname = usePathname();
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [profile, setProfile] = useState<{ display_name: string, role: string, avatar_url: string | null } | null>(null);

    // Fetch Profile on mount or user change
    useEffect(() => {
        if (user) {
            supabase.from('profiles').select('*').eq('id', user.id).single()
                .then(({ data }) => {
                    if (data) {
                        setProfile(data);
                    }
                    // Also check auth metadata for avatar if profile is missing it or strictly stick to one source?
                    // Let's rely on profiles table but fallback to metadata if needed
                    if (!data?.avatar_url && user.user_metadata?.avatar_url) {
                        setProfile(prev => prev ? ({ ...prev, avatar_url: user.user_metadata.avatar_url }) : ({ display_name: '', role: 'OPERATIVE', avatar_url: user.user_metadata.avatar_url }));
                    }
                });
        } else {
            setProfile(null);
        }
    }, [user]);

    const handleCreateSubmit = async () => {
        if (!newProjectName.trim()) {
            setIsCreating(false);
            return;
        }
        await createProject(newProjectName.trim());
        setNewProjectName("");
        setIsCreating(false);
        setIsProjectMenuOpen(false);
    };

    return (
        <aside
            className="fixed left-0 top-0 z-[60] h-screen w-16 border-r border-zinc-800 bg-[#000000] flex flex-col items-center py-4 transition-all hover:w-64 group overflow-visible"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
        >

            {/* Project Switcher */}
            <div className="mb-6 w-full px-2 relative">
                <button
                    onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 transition-colors text-zinc-100 border border-transparent hover:border-zinc-800"
                    title={activeProject?.name || "Select Project"}
                >
                    <div className="h-8 w-8 rounded bg-zinc-900 text-emerald-500 flex items-center justify-center shrink-0 font-bold border border-zinc-800">
                        {isLoading ? "..." : (activeProject?.name.substring(0, 1) || "+")}
                    </div>
                    <div className="hidden group-hover:block animate-in fade-in slide-in-from-left-1 duration-300 text-left whitespace-nowrap overflow-hidden text-sm font-medium flex-1">
                        {isLoading ? "Loading..." : activeProject?.name || "Select Project"}
                    </div>
                    <ChevronDown className="h-4 w-4 hidden group-hover:block animate-in fade-in slide-in-from-left-1 duration-300 shrink-0 text-zinc-500" />
                </button>

                {/* Dropdown Menu */}
                {isProjectMenuOpen && (
                    <div className="absolute top-14 left-2 w-56 bg-[#0a0a0a] border border-zinc-800 shadow-xl rounded-md z-[60] p-1 animate-in fade-in zoom-in-95 duration-100 text-zinc-200">
                        <div className="text-xs font-semibold text-zinc-500 px-2 py-1.5 uppercase tracking-wider">
                            Projects
                        </div>
                        {projects.map(p => (
                            <button
                                key={p.id}
                                onClick={() => { switchProject(p.id); setIsProjectMenuOpen(false); router.push('/dashboard'); }}
                                className={cn(
                                    "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-zinc-900 flex items-center gap-2 transition-colors",
                                    activeProject?.id === p.id && "bg-zinc-900 font-medium text-emerald-400"
                                )}
                            >
                                <Folder className="h-4 w-4 text-zinc-500" />
                                <span className="truncate">{p.name}</span>
                            </button>
                        ))}
                        <div className="h-px bg-zinc-800 my-1" />
                        {isCreating ? (
                            <div className="px-2 py-1.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Project Name..."
                                    className="w-full bg-zinc-900 border border-emerald-500/50 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateSubmit();
                                        if (e.key === 'Escape') setIsCreating(false);
                                    }}
                                />
                                <button
                                    onClick={handleCreateSubmit}
                                    className="p-1 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 border border-emerald-500/20"
                                >
                                    <Add className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-zinc-900 flex items-center gap-2 text-zinc-300 font-medium"
                            >
                                <Add className="h-4 w-4" /> New Project
                            </button>
                        )}
                        <button
                            onClick={() => { setIsManagerOpen(true); setIsProjectMenuOpen(false); }}
                            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-zinc-900 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 font-medium transition-colors"
                        >
                            <Settings className="h-4 w-4" /> Manage Projects
                        </button>
                    </div>
                )}
            </div>

            <ProjectManagerModal
                isOpen={isManagerOpen}
                onClose={() => setIsManagerOpen(false)}
            />

            {/* Navigation Body */}
            <nav className="flex flex-col gap-1 flex-1 w-full px-1 overflow-y-auto scrollbar-hide">

                {/* Mission Hub (Dashboard) Link */}
                <Link
                    href="/dashboard"
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white mb-4 group/item"
                >
                    <Dashboard className="h-5 w-5 text-emerald-500" />
                    <span className="hidden group-hover:block animate-in fade-in slide-in-from-left-1 duration-300 text-sm font-medium whitespace-nowrap">
                        Mission Hub
                    </span>
                </Link>

                <div className="px-2 mb-2 hidden group-hover:block animate-in fade-in slide-in-from-left-1 duration-300 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    The 11 Pillars
                </div>

                {PILLARS.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative w-full flex items-center justify-between gap-1 group-hover:gap-3 px-1 group-hover:px-2 py-2 rounded-md transition-all group/item",
                                isActive
                                    ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/20"
                                    : "text-zinc-400 hover:bg-emerald-950/20 hover:text-emerald-400/80 border border-transparent"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-emerald-500" : "text-zinc-500 group-hover/item:text-emerald-500/70")} />

                            <span className="hidden group-hover:block animate-in fade-in slide-in-from-left-1 duration-300 text-sm font-medium whitespace-nowrap flex-1">
                                {item.label}
                            </span>

                            <span className="text-[10px] font-bold font-mono text-zinc-500 border border-zinc-800 rounded px-1.5 py-0.5 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 shrink-0 bg-zinc-900/50">
                                {item.letter}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="w-full px-2 mb-4 mt-auto flex flex-col gap-2 border-t border-zinc-900/50 pt-2">
                {/* Admin Only: Hangar Entry */}
                {user?.email === 'mohammed@legiongrappling.com' && (
                    <Link
                        href="/hangar"
                        className="w-full flex items-center justify-center group-hover:justify-start gap-3 p-2 rounded-md hover:bg-indigo-950/20 transition-colors text-zinc-500 hover:text-indigo-400 mb-2 border border-transparent hover:border-indigo-500/20 group"
                    >
                        <Rocket className="h-4 w-4" />
                        <span className="text-xs font-mono font-bold tracking-widest hidden group-hover:block animate-in fade-in slide-in-from-left-2 duration-300 whitespace-nowrap">HANGAR PROTOCOL</span>
                    </Link>
                )}

                {/* Auth Control (Avatar Mode) */}
                {user ? (
                    <div className="flex flex-col gap-2">

                        {/* Profile Link (Avatar + Name) */}
                        <Link href="/profile" className="flex items-center justify-center group-hover:justify-start gap-3 p-1.5 rounded-lg hover:bg-zinc-900 transition-all group/profile w-full overflow-hidden">
                            {/* Avatar (Always Visible) */}
                            <div className="h-9 w-9 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                                {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                                    <img
                                        src={profile?.avatar_url || user.user_metadata?.avatar_url}
                                        alt="User"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-4 w-4 text-zinc-500" />
                                )}
                            </div>

                            {/* Name & Role (Visible on Expand) */}
                            <div className="flex flex-col gap-0.5 hidden group-hover:block animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
                                <span className="text-sm font-bold text-white truncate max-w-[140px]">
                                    {profile?.display_name || user.email?.split('@')[0]}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider bg-emerald-950/30 px-1 rounded border border-emerald-500/20">
                                        {profile?.role || "OPERATIVE"}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Controls (Settings + Logout) - Visible on Expand */}
                        <div className="flex items-center gap-1 hidden group-hover:flex animate-in fade-in slide-in-from-bottom-2 duration-300 px-1">
                            <Link
                                href="/profile"
                                className="flex-1 flex items-center justify-center gap-2 p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-xs font-medium border border-zinc-800"
                                title="Settings"
                            >
                                <Settings className="h-3 w-3" />
                                <span className="sr-only">Settings</span>
                            </Link>
                            <button
                                onClick={async () => {
                                    await signOut();
                                    router.push("/login");
                                    router.refresh();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 p-1.5 rounded bg-zinc-900 hover:bg-red-950/30 text-zinc-400 hover:text-red-400 transition-colors text-xs font-medium border border-zinc-800 hover:border-red-900/30"
                                title="Sign Out"
                            >
                                <LogOut className="h-3 w-3" />
                                <span className="sr-only">Sign Out</span>
                            </button>
                        </div>

                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="w-full flex items-center gap-3 p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white border border-zinc-800"
                    >
                        <LogIn className="h-4 w-4" />
                        <span className="hidden group-hover:block font-bold text-sm">Sign In</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
