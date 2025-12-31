"use client";

import React from 'react';
import { FileText, CheckCheck, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { User } from 'lucide-react';

interface DiscoveryArtifactViewerProps {
    livePRD: string;
    relayGenerated: boolean;
    onCompletePhase: () => void;
    isProcessing: boolean;
    className?: string;
    complexity: ComplexityLevel;
    setComplexity: (val: ComplexityLevel) => void;
    onClose?: () => void;
}

export function DiscoveryArtifactViewer({ livePRD, relayGenerated, onCompletePhase, isProcessing, className, complexity, setComplexity, onClose }: DiscoveryArtifactViewerProps) {
    return (
        <div className={cn("bg-[#020402] flex flex-col overflow-hidden", className)}>
            {/* Mobile-Only Settings Section */}
            <div className="lg:hidden p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        <User className="h-4 w-4" /> Consultant Settings
                    </div>
                    <ComplexitySelector value={complexity} onChange={setComplexity} />
                </div>
                <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

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
