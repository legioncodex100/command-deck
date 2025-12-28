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
import { useState } from "react";
import { Stage } from "@/types/database";
import { useRouter } from "next/navigation";
import { ProjectManagerModal } from "@/components/ProjectManagerModal";
import { Settings } from "lucide-react";

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
    { letter: 'I', label: 'Strategy Room', href: '/strategy', icon: CenterCircle, stage: 'STRATEGY' },
    { letter: 'J', label: 'Planning Hub', href: '/planning', icon: DataBlob, stage: 'PLANNING' },
    { letter: 'B', label: 'Substructure', href: '/substructure', icon: DataBase, stage: 'SUBSTRUCTURE' },
    { letter: 'H', label: 'Design Studio', href: '/design', icon: ColorPalette, stage: 'DESIGN' },
    { letter: 'C', label: 'Construction', href: '/construction', icon: Construction, stage: 'CONSTRUCTION' },
    { letter: 'G', label: 'Integration', href: '/integration', icon: Integration, stage: 'INTEGRATION' },
    { letter: 'D', label: 'Auditor Lab', href: '/audit', icon: CertificateCheck, stage: 'AUDIT' },
    { letter: 'E', label: 'Context Bridge', href: '/memory', icon: MachineLearningModel, stage: 'MEMORY' },
    { letter: 'F', label: 'Doc Engine', href: '/docs', icon: Document, stage: 'HANDOVER' },
    { letter: 'K', label: 'Mission Mural', href: '/chronology', icon: Calendar, stage: 'CHRONOLOGY' },
];

export function Sidebar() {
    const { signOut } = useAuth();
    const { projects, activeProject, createProject, switchProject, isLoading } = useProject();
    const router = useRouter();
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

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
            className="fixed left-0 top-0 z-40 h-screen w-16 border-r border-zinc-800 bg-[#000000] flex flex-col items-center py-4 transition-all hover:w-64 group overflow-visible"
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
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-left whitespace-nowrap overflow-hidden text-sm font-medium flex-1">
                        {isLoading ? "Loading..." : activeProject?.name || "Select Project"}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 shrink-0 text-zinc-500" />
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
            <nav className="flex flex-col gap-1 flex-1 w-full px-2 overflow-y-auto scrollbar-hide">

                {/* Mission Hub (Dashboard) Link */}
                <Link
                    href="/dashboard"
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white mb-4 group/item"
                >
                    <Dashboard className="h-5 w-5 text-emerald-500" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium whitespace-nowrap">
                        Mission Hub
                    </span>
                </Link>

                <div className="px-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    The 11 Pillars
                </div>

                {PILLARS.map((item) => {
                    const isActive = activeProject?.current_stage === item.stage;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative w-full flex items-center gap-3 p-2 rounded-md transition-all group/item",
                                isActive
                                    ? "bg-zinc-900 text-emerald-400 border border-zinc-800"
                                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-emerald-500" : "text-zinc-500 group-hover/item:text-zinc-300")} />

                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium whitespace-nowrap flex-1">
                                {item.label}
                            </span>

                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-zinc-600 border border-zinc-800 rounded px-1">
                                {item.letter}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="w-full px-2 mb-4">

            </div>
        </aside>
    );
}
