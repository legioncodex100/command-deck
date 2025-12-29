
"use client";

import React, { useState } from 'react';
import {
    Rocket, Box, Brain, Cpu, Database, FileText, Layers, Layout, ShieldCheck,
    GitBranch, Archive, Command
} from 'lucide-react';

import MissionControl from '@/components/MissionControl';
// Real Pillars
import Pillar_A_Discovery from '@/components/pillars/Pillar_A_Discovery';
import Pillar_B_Strategy from '@/components/pillars/Pillar_B_Strategy';
import Pillar_C_Substructure from '@/components/pillars/Pillar_C_Substructure';
import Pillar_D_Design from '@/components/pillars/Pillar_D_Design';
import Pillar_E_Planning from '@/components/pillars/Pillar_E_Planning';
import Pillar_F_Construction from '@/components/pillars/Pillar_F_Construction';
// Mocks
import * as Pillars from '@/components/pillars/Mocks';

// --- Types ---
type ViewState = 'DASHBOARD' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';

// --- Sidebar Item ---
const NavItem = ({ id, label, icon: Icon, active, onClick }: any) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-[11px] font-mono tracking-wide uppercase ${active
            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
            }`}
    >
        <Icon className={`h-4 w-4 ${active ? 'text-emerald-500' : 'text-zinc-600'}`} />
        <span className="truncate">{label}</span>
        {active && <div className="ml-auto w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
    </button>
);

// --- Main Layout Router ---
export default function CommandDeckIndex() {
    const [view, setView] = useState<ViewState>('DASHBOARD');

    // Render Router
    const renderContent = () => {
        switch (view) {
            case 'DASHBOARD': return <MissionControl />;
            case 'A': return <Pillar_A_Discovery />;
            case 'B': return <Pillar_B_Strategy />;
            case 'C': return <Pillar_C_Substructure />;
            case 'D': return <Pillar_D_Design />;
            case 'E': return <Pillar_E_Planning />;
            case 'F': return <Pillar_F_Construction />;
            case 'G': return <Pillars.IntegrationBridge />;
            case 'H': return <Pillars.StructuralAuditor />;
            case 'I': return <Pillars.ContextBridge />;
            case 'J': return <Pillars.DocumentationEngine />;
            case 'K': return <Pillars.MissionMural />;
            default: return <MissionControl />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-black text-zinc-100 font-sans overflow-hidden selection:bg-emerald-500/30">
            {/* LEFT SIDEBAR */}
            <aside className="w-64 border-r border-zinc-800 bg-[#020402] flex flex-col shrink-0 z-20">
                {/* Header */}
                <div className="p-4 border-b border-zinc-900 bg-black/40">
                    <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-2 group">
                        <div className="h-8 w-8 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                            <Command className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Command Deck</span>
                            <span className="text-sm font-bold text-white tracking-tight">v4.8.0</span>
                        </div>
                    </button>
                </div>

                {/* Scrollable Navigation */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
                    <div className="px-2 py-3 text-[9px] font-bold text-emerald-900/40 uppercase tracking-[0.2em] select-none">Core Sequence</div>

                    <NavItem id="A" label="A. Discovery Lab" icon={Rocket} active={view === 'A'} onClick={setView} />
                    <NavItem id="B" label="B. Strategy Room" icon={Brain} active={view === 'B'} onClick={setView} />
                    <NavItem id="C" label="C. Substructure" icon={Database} active={view === 'C'} onClick={setView} />
                    <NavItem id="D" label="D. Design Studio" icon={Layout} active={view === 'D'} onClick={setView} />
                    <NavItem id="E" label="E. Planning Hub" icon={Layers} active={view === 'E'} onClick={setView} />
                    <NavItem id="F" label="F. Construction" icon={Cpu} active={view === 'F'} onClick={setView} />

                    <div className="px-2 py-3 mt-4 text-[9px] font-bold text-emerald-900/40 uppercase tracking-[0.2em] select-none flex items-center gap-2">
                        <span>Operations</span>
                        <div className="h-px bg-zinc-900 flex-1" />
                    </div>

                    <NavItem id="G" label="G. Integration" icon={GitBranch} active={view === 'G'} onClick={setView} />
                    <NavItem id="H" label="H. Auditor" icon={ShieldCheck} active={view === 'H'} onClick={setView} />
                    <NavItem id="I" label="I. Context Bridge" icon={Archive} active={view === 'I'} onClick={setView} />
                    <NavItem id="J" label="J. Documentation" icon={FileText} active={view === 'J'} onClick={setView} />
                    <NavItem id="K" label="K. Mission Mural" icon={Box} active={view === 'K'} onClick={setView} />
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-zinc-900 bg-black/20">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-emerald-950/10 border border-emerald-900/20">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-emerald-600">SYSTEM ONLINE</span>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-hidden relative bg-black">
                {renderContent()}
            </main>
        </div>
    );
}
