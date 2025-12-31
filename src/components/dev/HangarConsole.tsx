"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Save, Activity, GitBranch, Bug } from 'lucide-react';
import { syncMemoryToVault, commitVaultToMemory } from '@/services/hangar';
import { useSprint } from '@/hooks/useSprint';
import { KanbanQueue } from '../pillars/construction/KanbanQueue';
import { EngineerChat } from '../pillars/construction/EngineerChat';
import { PillarProvider } from '../pillars/PillarProvider';
import { supabase } from '@/services/supabase';

const CORE_PROJECT_ID = 'c0de0000-0000-0000-0000-000000000000';

export function HangarConsole() {
    const [mode, setMode] = useState<'EVOLUTION' | 'STABILIZATION'>('EVOLUTION');
    const [status, setStatus] = useState<string>("SYSTEM IDLE");
    const [syncing, setSyncing] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
        { role: 'model', text: 'Evolution Protocol Initialized. Ready for architectural directives.' }
    ]);

    // We use the useSprint hook pointing to the CORE PROJECT to manage Host tasks
    const { activeTask } = useSprint(CORE_PROJECT_ID);

    const handleSync = async () => {
        setSyncing(true);
        setStatus("SYNCING MEMORY BRIDGE...");
        const res = await syncMemoryToVault();
        if (res.error) {
            setStatus("SYNC FAILED: " + res.error);
        } else {
            setStatus("MEMORY SYNCED");
        }
        setSyncing(false);
    };

    return (
        <div className="h-full w-full bg-[#050505] text-zinc-300 font-mono flex flex-col">
            {/* Hangar Header */}
            <div className="h-14 border-b border-zinc-900 bg-black/80 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center border border-zinc-800">
                        <Terminal className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100">HANGAR CONSOLE</h1>
                        <p className="text-[10px] text-zinc-500 uppercase">Host Governance v1.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Status Monitor */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 rounded border border-zinc-800">
                        <Activity className={`h-3 w-3 ${syncing ? 'animate-pulse text-amber-500' : 'text-emerald-500'}`} />
                        <span className="text-xs font-bold text-zinc-400">{status}</span>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                        <button
                            onClick={() => setMode('EVOLUTION')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${mode === 'EVOLUTION'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <GitBranch className="h-3 w-3" /> EVOLUTION
                        </button>
                        <button
                            onClick={() => setMode('STABILIZATION')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${mode === 'STABILIZATION'
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Shield className="h-3 w-3" /> STABILIZATION
                        </button>
                    </div>

                    {/* Bridge Controls */}
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="p-2 hover:bg-zinc-800 rounded-md border border-transparent hover:border-zinc-700 transition-all text-zinc-400 hover:text-white"
                        title="Sync Memory (Read from Disk)"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden grid grid-cols-12">
                {/* Left: Host Stats & Directives */}
                <div className="col-span-3 border-r border-zinc-900 bg-[#080808] p-6 flex flex-col gap-6">
                    <div className="p-4 rounded bg-zinc-900/30 border border-zinc-800/50">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Host Vitality</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Core ID</span>
                                <span className="font-mono text-emerald-500">CONNECTED</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Memory</span>
                                <span className="font-mono text-zinc-300">RW-READY</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Active Workspace (Reusing Pillar F Components for now) */}
                {/* Center: Active Workspace OR Chat */}
                <div className="col-span-9 bg-black flex flex-col items-center justify-center text-zinc-600 border-l border-zinc-900">
                    {mode === 'EVOLUTION' ? (
                        <div className="w-full h-full flex flex-col">
                            <PillarProvider themeColor="emerald">
                                <EngineerChat
                                    enabled={true}
                                    messages={messages}
                                    onSendMessage={(text) => {
                                        setMessages(prev => [...prev, { role: 'user', text }]);
                                        // Mock response
                                        setTimeout(() => {
                                            setMessages(prev => [...prev, {
                                                role: 'model',
                                                text: `**Directive Received:** ${text}\n\n*Processing architectural implications...*`
                                            }]);
                                        }, 1000);
                                    }}
                                />
                            </PillarProvider>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Bug className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-sm">Select a Host Task to begin governance.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
