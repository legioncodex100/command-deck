"use client";

import React from 'react';
import { ArrowRight, CheckCheck, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody } from '../ui';
import { usePillarTheme } from '../PillarProvider';

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
    const theme = usePillarTheme();

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={FileText}
                title="DESIGN_SYSTEM.md"
                onClose={onClose}
                actions={
                    <div className="flex items-center gap-2">
                        {relayGenerated ? (
                            <div className={`flex items-center gap-2 px-3 py-1 ${theme.bg} rounded border ${theme.border} ${theme.text} text-[10px] font-bold uppercase tracking-wider`}>
                                <CheckCheck className="h-3 w-3" /> Phase Complete
                            </div>
                        ) : (
                            <button
                                onClick={onCompletePhase}
                                disabled={isProcessing}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50",
                                    staleState.isStale ? "bg-amber-600 hover:bg-amber-500" : `${theme.text.replace('text-', 'bg-').replace('400', '600')} hover:${theme.text.replace('text-', 'bg-').replace('400', '500')}`
                                )}
                            >
                                {staleState.isStale ? 'Complete (Stale)' : 'Complete Phase'} <ArrowRight className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                }
            />

            <PillarBody>
                <div className="p-6 font-mono text-[11px] leading-6 text-zinc-400 whitespace-pre-wrap">
                    {designDoc}
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
