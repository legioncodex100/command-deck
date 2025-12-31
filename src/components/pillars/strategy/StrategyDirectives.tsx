"use client";

import React from 'react';
import { Brain, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategyDirectivesProps {
    pillars: string[];
    currentPRDTitle?: string;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function StrategyDirectives({ pillars, currentPRDTitle, className, onClose }: StrategyDirectivesProps) {
    const PillarItem = ({ label, done }: { label: string, done: boolean }) => (
        <div className={`p-3 border-l-2 flex items-center justify-between transition-colors ${done ? 'bg-emerald-950/10 border-emerald-500' : 'bg-transparent border-zinc-800'}`}>
            <span className={`text-xs font-mono font-bold tracking-wider ${done ? 'text-emerald-400' : 'text-zinc-600'}`}>{label}</span>
            {done && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
        </div>
    );

    return (
        <div className={cn("flex flex-col overflow-hidden border-r border-emerald-500/10", className)}>
            <header className="p-4 flex items-center justify-between shrink-0 mb-2">
                <div>
                    <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <Brain className="h-4 w-4" /> Strategy Room
                    </h2>
                    <p className="text-[10px] text-zinc-600">PHASE 12.3 // ACTIVE</p>
                </div>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="lg:hidden p-2 text-zinc-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-emerald-900/50 flex flex-col gap-1">
                {["TENANCY", "STATE", "BOUNDARIES", "PRIVACY", "INFRASTRUCTURE"].map(p => (
                    <PillarItem key={p} label={p} done={pillars.some(active => active.toUpperCase() === p.toUpperCase())} />
                ))}
            </div>

            <div className="p-4 mt-auto shrink-0">
                <div className="p-3 border border-emerald-500/20 bg-emerald-950/20 rounded">
                    <div className="text-[10px] text-emerald-600 font-bold mb-1">CONTEXT LINK</div>
                    <div className="text-xs text-emerald-400 truncate">{currentPRDTitle || 'No PRD Linked'}</div>
                </div>
            </div>
        </div>
    );
}
