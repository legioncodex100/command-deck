"use client";

import React from 'react';
import { Database, ShieldCheck, Eye } from 'lucide-react';

interface SubstructurePillarsProps {
    pillars: string[];
    onShowVisualizer: () => void;
}

export function SubstructurePillars({ pillars, onShowVisualizer }: SubstructurePillarsProps) {
    const PillarItem = ({ label, done }: { label: string, done: boolean }) => (
        <div className={`p-3 border-l-2 flex items-center justify-between transition-colors ${done ? 'bg-indigo-950/20 border-indigo-500' : 'bg-transparent border-zinc-800'}`}>
            <span className={`text-xs font-mono font-bold tracking-wider ${done ? 'text-indigo-400' : 'text-zinc-600'}`}>{label}</span>
            {done && <ShieldCheck className="h-4 w-4 text-indigo-500" />}
        </div>
    );

    return (
        <div className="col-span-2 border-r border-indigo-500/10 flex flex-col gap-6 bg-black/40 overflow-hidden">
            <header className="p-4 flex flex-col gap-1 mb-2 shrink-0">
                <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    <Database className="h-4 w-4" /> Substructure
                </h2>
                <p className="text-[10px] text-zinc-600">PHASE 12.4 // ACTIVE</p>
            </header>

            <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-indigo-900/50 flex flex-col gap-1">
                {["TABLES", "RELATIONSHIPS", "INDEXES", "RLS", "FUNCTIONS"].map(p => (
                    <PillarItem key={p} label={p} done={pillars.some(active => active.toUpperCase() === p.toUpperCase())} />
                ))}
            </div>

            <div className="p-4 mt-auto shrink-0">
                <div className="p-3 border border-indigo-500/20 bg-indigo-950/10 rounded">
                    <button
                        onClick={onShowVisualizer}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-500/30 rounded text-xs text-indigo-300 transition-colors uppercase tracking-widest font-bold"
                    >
                        <Eye className="h-3 w-3" /> Visualizer
                    </button>
                </div>
            </div>
        </div>
    );
}
