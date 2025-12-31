"use client";

import React from 'react';
import { FileText, CheckCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody } from '../ui';
import { usePillarTheme } from '../PillarProvider';

interface StrategyArtifactViewerProps {
    liveStrategy: string;
    relayGenerated: boolean;
    staleState: { isStale: boolean; reason?: string | null };
    isProcessing: boolean;
    onCompletePhase: () => void;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function StrategyArtifactViewer({ liveStrategy, relayGenerated, staleState, isProcessing, onCompletePhase, className, onClose }: StrategyArtifactViewerProps) {
    const theme = usePillarTheme();

    // Determine the base color for dynamic string construction if needed, mostly already covered by theme.* but buttons need explicit overrides
    const activeColor = theme.text.split('-')[1];

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={FileText}
                title="STRATEGY.md"
                onClose={onClose}
                actions={
                    relayGenerated ? (
                        <div className={`flex items-center gap-2 px-3 py-1 ${theme.bg} rounded border ${theme.border} ${theme.text} text-[10px] font-bold uppercase tracking-wider`}>
                            <CheckCheck className="h-3 w-3" /> Phase Complete
                        </div>
                    ) : (
                        <button
                            onClick={onCompletePhase}
                            disabled={isProcessing}
                            className={`flex items-center gap-2 px-3 py-1 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50 ${staleState.isStale ? 'bg-amber-600 hover:bg-amber-500' : `${theme.text.replace('text-', 'bg-').replace('400', '600')} hover:${theme.text.replace('text-', 'bg-').replace('400', '500')}`}`}
                        >
                            {staleState.isStale ? 'Complete (Stale)' : 'Complete Phase'} <ArrowRight className="h-3 w-3" />
                        </button>
                    )
                }
            />

            {staleState.isStale && (
                <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 flex items-center gap-2 shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide truncate">Ripple: {staleState.reason}</span>
                </div>
            )}

            <PillarBody>
                <div className="p-6 font-mono text-[11px] leading-6 text-zinc-400 whitespace-pre-wrap">
                    {liveStrategy}
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
