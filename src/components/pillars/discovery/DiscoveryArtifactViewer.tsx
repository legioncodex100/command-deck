"use client";

import React from 'react';
import { FileText, CheckCheck, ArrowRight } from 'lucide-react';

interface DiscoveryArtifactViewerProps {
    livePRD: string;
    relayGenerated: boolean;
    onCompletePhase: () => void;
    isProcessing: boolean;
}

export function DiscoveryArtifactViewer({ livePRD, relayGenerated, onCompletePhase, isProcessing }: DiscoveryArtifactViewerProps) {
    return (
        <div className="col-span-4 bg-[#020402] flex flex-col overflow-hidden">
            <div className="p-3 border-b border-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest">Live Artifact: PRD.md</span>
                </div>

                {relayGenerated ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/30 rounded border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCheck className="h-3 w-3" /> Phase Complete
                    </div>
                ) : (
                    <button
                        onClick={onCompletePhase}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50"
                    >
                        Complete Phase <ArrowRight className="h-3 w-3" />
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-zinc-400 whitespace-pre-wrap scrollbar-thin hover:scrollbar-thumb-emerald-900">
                {livePRD}
            </div>
        </div>
    );
}
