"use client";

import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignDirectivesProps {
    pillars: string[];
    staleState: { isStale: boolean; reason?: string | null };
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function DesignDirectives({ pillars, staleState, className, onClose }: DesignDirectivesProps) {
    const PillarItem = ({ label, done }: { label: string, done: boolean }) => (
        <div className={cn(
            "p-3 border-l-2 flex items-center justify-between transition-colors",
            done ? "bg-indigo-950/20 border-indigo-500" : "bg-transparent border-zinc-800"
        )}>
            <span className={cn(
                "text-xs font-mono font-bold tracking-wider",
                done ? "text-indigo-400" : "text-zinc-600"
            )}>{label}</span>
            {done && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
        </div>
    );

    return (
        <div className={cn("flex flex-col overflow-hidden border-r border-[#27272a] bg-[#020402]", className)}>
            <header className="p-4 flex items-center justify-between shrink-0 mb-2 border-b border-white/5">
                <div>
                    <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Design Studio
                    </h2>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-zinc-600">PHASE 12.5 // ACTIVE</p>
                    </div>
                </div>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="lg:hidden p-2 text-zinc-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </header>

            {staleState.isStale && (
                <div className="mx-4 mt-2 mb-2 text-[9px] text-amber-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Input Updated</span>
                </div>
            )}

            <div className="flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-indigo-900/50 flex flex-col gap-1">
                    {["PALETTE", "TYPOGRAPHY", "COMPONENTS", "LAYOUTS", "INTERACTIONS"].map(p => (
                        <PillarItem key={p} label={p} done={pillars.some(active => active.toUpperCase() === p.toUpperCase())} />
                    ))}
                </div>
            </div>
        </div>
    );
}
