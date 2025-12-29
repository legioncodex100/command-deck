"use client";

import React from 'react';
import { Sparkles, Activity } from 'lucide-react';

interface DiscoveryRoadmapProps {
    phases: string[];
}

export function DiscoveryRoadmap({ phases }: DiscoveryRoadmapProps) {
    const RoadmapItem = ({ label, done }: { label: string, done: boolean }) => (
        <div className={`p-3 rounded border flex items-center justify-between ${done ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-black/40 border-zinc-800'}`}>
            <span className={`text-xs font-mono uppercase tracking-widest ${done ? 'text-emerald-400' : 'text-zinc-500'}`}>{label}</span>
            {done && <Activity className="h-3 w-3 text-emerald-500" />}
        </div>
    );

    return (
        <div className="col-span-3 border-r border-emerald-500/20 bg-[#020402] flex flex-col overflow-hidden">
            <header className="p-4 flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 rounded bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Discovery Lab</h2>
                    <p className="text-[10px] text-emerald-500/60 font-mono">PHASE 12.2 // ACTIVE</p>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-4 scrollbar-thin scrollbar-thumb-emerald-900/50">
                {["VISION", "AUDIENCE", "LOGIC", "FEATURES", "EDGE_CASES"].map(p => (
                    <RoadmapItem key={p} label={p} done={phases.some(active => active.toUpperCase() === p.toUpperCase())} />
                ))}
            </div>
        </div>
    );
}
