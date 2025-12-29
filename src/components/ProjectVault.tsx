"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/services/supabase";
import { FileText, Database, Code, PenTool, Loader2, Copy, Trash2, Eye, ArrowRight, Sparkles } from "lucide-react";
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

    const getIcon = (type: string) => {
        if (type.includes('PRD')) return FileText;
        if (type.includes('SCHEMA') || type.includes('BLUEPRINT')) return Database;
        if (type.includes('DESIGN')) return PenTool;
        if (type.includes('STITCH')) return Sparkles;
        if (type.includes('INSTRUCTIONS')) return Code;
        return FileText;
    };

    const getColor = (type: string) => {
        if (type.includes('PRD')) return "text-blue-400";
        if (type.includes('SCHEMA')) return "text-cyan-400";
        if (type.includes('DESIGN')) return "text-purple-400";
        if (type.includes('STITCH')) return "text-indigo-400";
        if (type.includes('STRATEGY')) return "text-emerald-400";
        if (type.includes('INSTRUCTIONS')) return "text-orange-400";
        return "text-zinc-400";
    };

    const documents = items.filter(i => i.source === 'documents');
    const blueprints = items.filter(i => i.source === 'blueprints');

    // If empty state
    if (!documents.length && !blueprints.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border border-dashed border-zinc-800 rounded-md bg-[#0a0a0a]">
                <FileText className="h-8 w-8 mb-2 opacity-50" />
                <p>No artifacts in the vault yet.</p>
                <div className="text-xs mt-2">Start a mission to generate data.</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* PRDs / Docs */}
            {documents.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-mono text-emerald-500/70 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {documents.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setViewItem(doc)}
                                className="group bg-[#020402] border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/10 rounded-lg p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col min-h-[11rem]"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-3 w-3 text-emerald-500" />
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="h-8 w-8 rounded bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-mono text-emerald-400/60 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider ml-2 shrink-0">
                                        {doc.type}
                                    </span>
                                </div>
                                <h4 className="font-medium text-emerald-100 text-sm group-hover:text-white mb-2 leading-tight break-words">
                                    {doc.title || getPublicDocTitle(doc.type)}
                                </h4>
                                <p className="text-[10px] text-zinc-500 line-clamp-3 mb-auto leading-relaxed">
                                    {doc.summary || "No description available."}
                                </p>
                                <div className="text-[10px] text-emerald-500/40 font-mono mt-3 pt-3 border-t border-emerald-500/10 flex justify-between items-center">
                                    <span>{new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Blueprints / Technical Artifacts */}
            {blueprints.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-mono text-emerald-500/70 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Database className="w-3 h-3" /> Blueprints
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {blueprints.map(bp => (
                            <div
                                key={bp.id}
                                onClick={() => setViewItem(bp)}
                                className="group bg-[#020402] border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/10 rounded-lg p-4 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-3 w-3 text-emerald-500" />
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="h-8 w-8 rounded bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Database className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-mono text-emerald-400/60 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider">
                                        v{bp.version}
                                    </span>
                                </div>
                                <h4 className="font-medium text-emerald-100 text-sm group-hover:text-white mb-2 leading-tight break-words">
                                    {bp.title || (typeof bp.content === 'object' && bp.content?.title) || (typeof bp.content === 'object' && bp.content?.name) || bp.project_name || "System Blueprint"}
                                </h4>
                                <div className="text-[10px] text-emerald-500/40 font-mono mt-3 pt-3 border-t border-emerald-500/10">
                                    {new Date(bp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
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

// Helper to make helpful titles
function getPublicDocTitle(type: string) {
    switch (type) {
        case 'PRD': return 'Product Manifesto';
        case 'STRATEGY': return 'Technical Strategy';
        case 'DESIGN': return 'Design System DNA';
        case 'STITCH_PROMPT': return 'Stitch Visual Protocol';
        case 'TECH_SPEC': return 'Developer Guide';
        case 'USER_GUIDE': return 'User Manual';
        default: return type.replace(/_/g, ' ');
    }
}
