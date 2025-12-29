"use client";

import React from 'react';
import { Code, CheckCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface SubstructureSchemaViewerProps {
    liveSchema: string;
    relayGenerated: boolean;
    staleState: { isStale: boolean; reason?: string | null };
    isProcessing: boolean;
    onCompletePhase: () => void;
}

export function SubstructureSchemaViewer({ liveSchema, relayGenerated, staleState, isProcessing, onCompletePhase }: SubstructureSchemaViewerProps) {
    return (
        <div className="col-span-5 flex flex-col border-l border-zinc-900 bg-[#0A0A0A] relative overflow-hidden">
            <header className="p-3 border-b border-zinc-900 flex justify-between items-center bg-black/60">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <Code className="h-4 w-4 text-indigo-500" /> SCHEMA.sql
                </div>
                {relayGenerated ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-900/30 rounded border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCheck className="h-3 w-3" /> Phase Complete
                    </div>
                ) : (
                    <button
                        onClick={onCompletePhase}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50 ${staleState.isStale ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                    >
                        {staleState.isStale ? 'Complete (Stale)' : 'Complete Phase'} <ArrowRight className="h-3 w-3" />
                    </button>
                )}
            </header>
            {staleState.isStale && (
                <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Context Ripple: {staleState.reason}</span>
                </div>
            )}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-5 text-zinc-400 scrollbar-thin">
                <pre className="whitespace-pre-wrap">{liveSchema}</pre>
            </div>
        </div>
    );
}
