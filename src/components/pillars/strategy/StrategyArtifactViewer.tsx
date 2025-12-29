"use client";

import React from 'react';
import { FileText, CheckCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface StrategyArtifactViewerProps {
    liveStrategy: string;
    relayGenerated: boolean;
    staleState: { isStale: boolean; reason?: string | null };
    isProcessing: boolean;
    onCompletePhase: () => void;
}

export function StrategyArtifactViewer({ liveStrategy, relayGenerated, staleState, isProcessing, onCompletePhase }: StrategyArtifactViewerProps) {
    return (
        <div className="col-span-4 bg-[#050505] flex flex-col border-l border-zinc-900 overflow-hidden">
            <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <FileText className="h-4 w-4" /> STRATEGY.md
                </div>
                {relayGenerated ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/30 rounded border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCheck className="h-3 w-3" /> Phase Complete
                    </div>
                ) : (
                    <button
                        onClick={onCompletePhase}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 px-3 py-1 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50 ${staleState.isStale ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                        {staleState.isStale ? 'Complete (Stale)' : 'Complete Phase'} <ArrowRight className="h-3 w-3" />
                    </button>
                )}
            </header>
            {staleState.isStale && (
                <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide truncate">Ripple: {staleState.reason}</span>
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-6 text-zinc-400 whitespace-pre-wrap scrollbar-thin">
                {liveStrategy}
            </div>
        </div>
    );
}
