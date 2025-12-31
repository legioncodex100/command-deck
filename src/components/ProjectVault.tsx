"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/services/supabase";
import { FileText, Database, Code, PenTool, Sparkles, Folder, FolderOpen, ChevronRight, ChevronDown, File, Terminal, LayoutGrid, List, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TerminalModal } from "@/components/TerminalModal";

interface VaultItem {
    id: string;
    created_at: string;
    type: string;
    content: any; // string or object
    metadata?: any;
    source: 'documents' | 'blueprints';
    version?: number;
    project_name?: string;
    title?: string;
    summary?: string;
}

export function ProjectVault() {
    const { activeProjectId } = useProject();
    const [items, setItems] = useState<VaultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewItem, setViewItem] = useState<VaultItem | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);

    const fetchVault = async () => {
        if (!activeProjectId) return;
        setIsLoading(true);
        try {
            // Fetch Documents
            const { data: docs } = await supabase
                .from('documents')
                .select('*')
                .eq('project_id', activeProjectId)
                .order('created_at', { ascending: false });

            // Fetch Blueprints
            const { data: blues } = await supabase
                .from('blueprints')
                .select('*')
                .eq('project_id', activeProjectId)
                .order('created_at', { ascending: false });

            const mappedDocs = (docs || []).map((d: any) => ({ ...d, source: 'documents' as const }));
            const mappedBlues = (blues || []).map((b: any) => ({ ...b, source: 'blueprints' as const, type: `BLUEPRINT_v${b.version}` }));

            const all = [...mappedDocs, ...mappedBlues].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setItems(all);
        } catch (e) {
            console.error("Vault fetch error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVault();
    }, [activeProjectId]);

    // Group items by PILLAR
    const groupedItems = items.reduce((acc, item) => {
        const pillar = getPillar(item);
        if (!acc[pillar]) acc[pillar] = [];
        acc[pillar].push(item);
        return acc;
    }, {} as Record<string, VaultItem[]>);

    const sortedPillars = Object.keys(groupedItems).sort();

    if (items.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-600 font-mono text-xs border border-dashed border-zinc-800 rounded-md bg-[#050505]">
                <Folder className="h-8 w-8 mb-2 opacity-50" />
                <p>_vault_empty</p>
                <div className="text-[10px] mt-1 text-zinc-700">Initialize mission to generate artifacts.</div>
            </div>
        );
    }

    return (
        <div className="font-mono text-xs select-none">
            {/* Header: Path & View Toggles */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/50 text-zinc-500">
                <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
                    <Terminal className="w-3 h-3" />
                    <span>/root/vault</span>
                    {viewMode === 'grid' && currentFolder && (
                        <>
                            <span>/</span>
                            <span className="text-emerald-500">{currentFolder}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-1 rounded hover:bg-zinc-800 transition-colors", viewMode === 'list' ? "bg-zinc-800 text-emerald-400" : "text-zinc-500")}
                        title="List View"
                    >
                        <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-1 rounded hover:bg-zinc-800 transition-colors", viewMode === 'grid' ? "bg-zinc-800 text-emerald-400" : "text-zinc-500")}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="space-y-0.5">
                    {sortedPillars.map(pillar => (
                        <VaultFolder
                            key={pillar}
                            name={pillar}
                            items={groupedItems[pillar]}
                            onSelect={setViewItem}
                        />
                    ))}
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div>
                    {currentFolder ? (
                        // Inside a Folder
                        <div className="space-y-4">
                            <button
                                onClick={() => setCurrentFolder(null)}
                                className="flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors mb-4"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                <span>Back to root</span>
                            </button>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {groupedItems[currentFolder]?.map(item => (
                                    <GridFile key={item.id} item={item} onClick={() => setViewItem(item)} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Root Level Folders
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {sortedPillars.map(pillar => (
                                <GridFolder
                                    key={pillar}
                                    name={pillar}
                                    count={groupedItems[pillar].length}
                                    onClick={() => setCurrentFolder(pillar)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <TerminalModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title={viewItem ? (viewItem.source === 'documents' ? (viewItem.title || getPublicDocTitle(viewItem.type)) : (typeof viewItem.content === 'object' && viewItem.content?.title) || "System Blueprint") : ""}
                content={
                    viewItem?.content?.sql ? viewItem.content.sql :
                        (typeof viewItem?.content === 'string' ? viewItem.content : JSON.stringify(viewItem?.content || {}, null, 2))
                }
                type={viewItem?.type}
            />
        </div>
    );
}

// --- List View Components ---

function VaultFolder({ name, items, onSelect }: { name: string, items: VaultItem[], onSelect: (item: VaultItem) => void }) {
    const [isOpen, setIsOpen] = useState(true); // Default open for nicer overview

    return (
        <div>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 p-1 rounded hover:bg-zinc-800/50 cursor-pointer text-zinc-400 hover:text-emerald-400 transition-colors group"
            >
                <div className="w-4 flex justify-center">
                    {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </div>
                {isOpen ?
                    <FolderOpen className="h-3.5 w-3.5 text-emerald-500/80 group-hover:text-emerald-400" /> :
                    <Folder className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-500/80" />
                }
                <span className="font-bold">{name}</span>
                <span className="text-[10px] text-zinc-700 ml-auto mr-2">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
            </div>

            {isOpen && (
                <div className="ml-2 pl-2 border-l border-zinc-800/50 space-y-0.5 py-0.5">
                    {items.map(item => (
                        <VaultFile key={item.id} item={item} onClick={() => onSelect(item)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function VaultFile({ item, onClick }: { item: VaultItem, onClick: () => void }) {
    const Icon = getIcon(item.type);
    const colorClass = getColor(item.type);

    // Normalize date
    const dateStr = new Date(item.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '.');

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-2 p-1 pl-6 rounded hover:bg-zinc-800 cursor-pointer group text-zinc-500 hover:text-emerald-100 transition-colors"
        >
            <Icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", colorClass)} />
            <span className="truncate flex-1">
                {item.title || (item.source === 'blueprints' ? `v${item.version} Blueprint` : getPublicDocTitle(item.type))}
            </span>
            <span className="text-[9px] text-zinc-700 group-hover:text-zinc-600 shrink-0 tabular-nums">
                {dateStr}
            </span>
        </div>
    )
}

// --- Grid View Components ---

function GridFolder({ name, count, onClick }: { name: string, count: number, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/80 cursor-pointer group transition-all"
        >
            <Folder className="h-10 w-10 text-zinc-600 group-hover:text-emerald-500 mb-3 transition-colors" />
            <span className="text-[10px] font-bold text-zinc-400 group-hover:text-emerald-100 text-center leading-tight">
                {name}
            </span>
            <span className="text-[9px] text-zinc-600 mt-1">
                {count} items
            </span>
        </div>
    );
}

function GridFile({ item, onClick }: { item: VaultItem, onClick: () => void }) {
    const Icon = getIcon(item.type);
    const colorClass = getColor(item.type);
    const title = item.title || (item.source === 'blueprints' ? `v${item.version} Blueprint` : getPublicDocTitle(item.type));

    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/80 cursor-pointer group transition-all h-full"
        >
            <Icon className={cn("h-8 w-8 mb-3 transition-colors", colorClass)} />
            <span className="text-[10px] text-zinc-400 group-hover:text-emerald-100 text-center leading-tight line-clamp-2 break-all">
                {title}
            </span>
        </div>
    );
}

// --- Helpers ---

function getPillar(item: VaultItem): string {
    if (item.source === 'blueprints') return 'System_Blueprints';

    const t = item.type;
    if (t === 'PRD' || t === 'USER_GUIDE') return '01_Discovery_Lab';
    if (t === 'STRATEGY') return '02_Strategy_Room';
    if (t === 'DESIGN' || t === 'STITCH_PROMPT') return '03_Design_Studio';
    if (t.includes('SCHEMA')) return '04_Substructure';
    if (t.includes('INSTRUCTIONS') || t === 'TECH_SPEC') return '05_Construction';

    return '99_Unsorted';
}

function getIcon(type: string) {
    if (type.includes('BLUEPRINT')) return Database;
    if (type.includes('PRD')) return FileText;
    if (type.includes('SCHEMA')) return Database;
    if (type.includes('DESIGN')) return PenTool;
    if (type.includes('STITCH')) return Sparkles;
    if (type.includes('INSTRUCTIONS')) return Code;
    return File;
}

function getColor(type: string) {
    if (type.includes('BLUEPRINT')) return "text-cyan-500/70 group-hover:text-cyan-400";
    if (type.includes('PRD')) return "text-blue-500/70 group-hover:text-blue-400";
    if (type.includes('SCHEMA')) return "text-cyan-500/70 group-hover:text-cyan-400";
    if (type.includes('DESIGN')) return "text-purple-500/70 group-hover:text-purple-400";
    if (type.includes('STITCH')) return "text-indigo-500/70 group-hover:text-indigo-400";
    if (type.includes('STRATEGY')) return "text-emerald-500/70 group-hover:text-emerald-400";
    if (type.includes('INSTRUCTIONS')) return "text-orange-500/70 group-hover:text-orange-400";
    return "text-zinc-500 group-hover:text-zinc-400";
}

function getPublicDocTitle(type: string) {
    switch (type) {
        case 'PRD': return 'Product_Manifesto.md';
        case 'STRATEGY': return 'Technical_Strategy.md';
        case 'DESIGN': return 'Design_System_DNA.json';
        case 'STITCH_PROMPT': return 'Stitch_Protocol.txt';
        case 'TECH_SPEC': return 'Dev_Guide.md';
        case 'USER_GUIDE': return 'User_Manual.md';
        default: return type.toLowerCase() + '.txt';
    }
}
