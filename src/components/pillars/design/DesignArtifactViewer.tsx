"use client";

import React from 'react';
import { ArrowRight, CheckCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignArtifactViewerProps {
    designDoc: string;
    relayGenerated: boolean;
    staleState: { isStale: boolean; reason?: string | null };
    isProcessing: boolean;
    onCompletePhase: () => void;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function DesignArtifactViewer({
    designDoc, relayGenerated, staleState,
    isProcessing, onCompletePhase, className, onClose
}: DesignArtifactViewerProps) {
    return (
        <div className={cn("bg-[#050505] flex flex-col border-l border-zinc-900 overflow-hidden", className)}>
            <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <FileText className="h-4 w-4" /> DESIGN_SYSTEM.md
                </div>
                <div className="flex items-center gap-2">
                    {relayGenerated ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-900/30 rounded border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCheck className="h-3 w-3" /> Phase Complete
                        </div>
                    ) : (
                        <button
                            onClick={onCompletePhase}
                            disabled={isProcessing}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50",
                                staleState.isStale ? "bg-amber-600 hover:bg-amber-500" : "bg-indigo-600 hover:bg-indigo-500"
                            )}
                        >
                            {staleState.isStale ? 'Complete (Stale)' : 'Complete Phase'} <ArrowRight className="h-3 w-3" />
                        </button>
                    )}
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-1 text-zinc-500 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-6 text-zinc-400 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-zinc-800">
                {designDoc}
            </div>
        </div>
    );
}

function FileText({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
