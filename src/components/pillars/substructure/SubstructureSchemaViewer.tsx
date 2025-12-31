"use client";

import React from 'react';
import { Code, CheckCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { PillarPanel, PillarHeader, PillarBody } from '../ui';
import { usePillarTheme } from '../PillarProvider';

interface SubstructureSchemaViewerProps {
    liveSchema: string;
    relayGenerated: boolean;
    staleState: { isStale: boolean; reason?: string | null };
    isProcessing: boolean;
    onCompletePhase: () => void;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function SubstructureSchemaViewer({ liveSchema, relayGenerated, staleState, isProcessing, onCompletePhase, className, onClose }: SubstructureSchemaViewerProps) {
    const theme = usePillarTheme();

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={Code}
                title="SCHEMA.sql"
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
                            className={`flex items-center gap-2 px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50 ${staleState.isStale ? 'bg-amber-600 hover:bg-amber-500' : `${theme.bg.replace('/20', '/80')} hover:${theme.bg.replace('/20', '/60')}`}`}
                        >
                            {staleState.isStale ? 'Complete (Stale)' : 'Complete Phase'} <ArrowRight className="h-3 w-3" />
                        </button>
                    )
                }
            />
            {staleState.isStale && (
                <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Context Ripple: {staleState.reason}</span>
                </div>
            )}
            <PillarBody>
                <div className="p-4 font-mono text-xs leading-5 text-zinc-400 whitespace-pre-wrap">
                    {liveSchema}
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
