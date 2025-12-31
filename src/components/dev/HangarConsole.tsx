
"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Network, Shield, Activity, Zap, Bug, GitBranch, MessageSquare, Plus, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedChatInterface } from '@/components/pillars/ui/UnifiedChatInterface';
import { PillarProvider } from '@/components/pillars/PillarProvider';
import { HostVitalityPanel } from './HostVitalityPanel';
import { supabase } from '@/services/supabase';

type Evolution = {
    id: string;
    title: string;
    description: string;
    status: 'IDEA' | 'PLANNED' | 'PUSHED' | 'COMPLETED';
    created_at: string;
};

export function HangarConsole() {
    const [mode, setMode] = useState<'EVOLUTION' | 'GOVERNANCE'>('EVOLUTION');
    const [evolutions, setEvolutions] = useState<Evolution[]>([]);
    const [selectedEvolution, setSelectedEvolution] = useState<Evolution | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Chat State (Mocking messages per evolution for now, or unified?)
    // In a real app, we'd fetch messages for the selected evolution.
    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Fetch Evolutions
        const fetchEvolutions = async () => {
            const { data, error } = await supabase
                .from('evolutions')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setEvolutions(data as Evolution[]);
        };

        fetchEvolutions();
    }, []);

    const handleSelectEvolution = (evo: Evolution) => {
        setSelectedEvolution(evo);
        setIsDrawerOpen(true);
        // Reset chat or load specific chat history here
        setMessages([
            { role: 'model', text: `**Evolution Advisor Online.**\n\nSelected Context: *${evo.title}*\n\nHow can I assist with this evolution directive?` }
        ]);
        setInput("");
        setIsProcessing(false);
    };

    const handleSend = (text: string) => {
        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsProcessing(true);
        setInput("");

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'model',
                text: `**Processing update on ${selectedEvolution?.title}...**\n\nRecorded: "${text}"`
            }]);
            setIsProcessing(false);
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IDEA': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'PLANNED': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'PUSHED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'COMPLETED': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
            default: return 'text-zinc-500';
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] text-zinc-300 relative overflow-hidden">
            {/* Header */}
            <div className="h-auto md:h-14 pt-12 pb-4 md:pt-0 md:pb-0 border-b border-zinc-900 bg-black/80 flex flex-col md:flex-row items-start md:items-center justify-between px-6 shrink-0 z-10 gap-4 md:gap-0">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center border border-zinc-800">
                        <Terminal className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100">STRATCOM COMMAND</h1>
                        <p className="text-[10px] text-zinc-500 uppercase">Evolution Lab & Roadmap</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setMode('EVOLUTION')}
                        className={cn(
                            "px-3 py-1.5 rounded text-xs transition-all flex items-center gap-2",
                            mode === 'EVOLUTION' ? "bg-zinc-800 text-emerald-400 font-medium" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <GitBranch className="h-3.5 w-3.5" />
                        <span>EVOLUTION ({evolutions.length})</span>
                    </button>
                    {/* Placeholder for Governance Mode */}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">

                {/* Evolution List (Left / Main) */}
                <div className="col-span-12 lg:col-span-4 border-r border-zinc-900 bg-black flex flex-col">
                    <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Evolutions</span>
                        <button className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                        {evolutions.length === 0 ? (
                            <div className="p-8 text-center text-zinc-600 text-xs">
                                No active evolutions found. Start a new directive.
                            </div>
                        ) : (
                            evolutions.map(evo => (
                                <button
                                    key={evo.id}
                                    onClick={() => handleSelectEvolution(evo)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-lg border transition-all group relative overflow-hidden",
                                        selectedEvolution?.id === evo.id
                                            ? "bg-zinc-900 border-emerald-500/30 shadow-[inset_2px_0_0_0_#10b981]"
                                            : "bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className={cn(
                                            "font-bold text-sm line-clamp-1",
                                            selectedEvolution?.id === evo.id ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
                                        )}>
                                            {evo.title}
                                        </h3>
                                        {selectedEvolution?.id === evo.id && (
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider",
                                            getStatusColor(evo.status)
                                        )}>
                                            {evo.status}
                                        </span>
                                    </div>

                                    <ChevronRight className={cn(
                                        "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 opacity-0 -translate-x-2 transition-all",
                                        "group-hover:opacity-100 group-hover:translate-x-0"
                                    )} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Host Vitality (Hidden on Mobile, Visible on Desktop in col-span-3 or similar?) 
                    Actually, let's keep the layout simple for now. 
                    The user requested drawer behavior similar to mobile. 
                    We can essentially use the drawer for the "detail" view on all screens or split it on large screens.
                    Let's stick to the Drawer pattern as requested for now, maybe split view on desktop later if needed.
                    Actually, for Desktop, a split view is usually better. 
                    User said "come in as a drawer from the side just like the deck mobile".
                    This implies an overlay drawer.
                */}

                {/* Desktop Placeholder (Optimization: Show something here if no drawer? Or make list full width on Desktop and drawer always slides over?)
                    Let's make list full width (or reasonable width) and Drawer appears on top.
                */}
                <div className="hidden lg:flex col-span-8 bg-[#080808] flex-col items-center justify-center text-zinc-600">
                    <div className="w-96 text-center">
                        <Terminal className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-zinc-500 mb-2">Evolution Lab</h3>
                        <p className="text-sm">Select an evolution directive from the list to engage the Advisor or view details.</p>
                    </div>
                </div>

            </div>

            {/* Slide-over Drawer (The "Chat") */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-black border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
                isDrawerOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Drawer Header */}
                <div className="h-14 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-sm tracking-wider uppercase text-zinc-200">
                            {selectedEvolution?.title || "Evolution Advisor"}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Drawer Content (Chat) */}
                <div className="flex-1 overflow-hidden flex flex-col bg-black">
                    <PillarProvider themeColor="emerald">
                        <UnifiedChatInterface
                            title={selectedEvolution?.title || "Evolution Advisor"}
                            subtitle={selectedEvolution ? `Status: ${selectedEvolution.status}` : "Select a directive"}
                            icon={MessageSquare}
                            messages={messages}
                            input={input}
                            setInput={setInput}
                            isProcessing={isProcessing}
                            onSend={handleSend}
                            className="h-full border-0"
                            headerActions={
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-emerald-500 font-mono">ONLINE</span>
                                </div>
                            }
                        />
                    </PillarProvider>
                </div>
            </div>

            {/* Backdrop for Drawer (Mobile only? Or always to focus?) */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}
        </div>
    );
}

