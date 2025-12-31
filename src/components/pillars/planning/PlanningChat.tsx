"use client";

import React, { useState } from 'react';
import { Terminal, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { UnifiedChatInterface, Message } from '../ui/UnifiedChatInterface';

interface PlanningChatProps {
    messages: { role: 'user' | 'model'; text: string; }[];
    onSendMessage: (text: string) => void;
    onClear: () => void;
    isProcessing: boolean;
    className?: string;
}

export function PlanningChat({ messages, onSendMessage, onClear, isProcessing, className }: PlanningChatProps) {
    const [input, setInput] = useState("");

    const handleSend = (text: string) => {
        onSendMessage(text);
        setInput("");
    };

    const emptyState = (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
            <div className="h-16 w-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <Sparkles className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-100 mb-2">Planning Hub</h3>
            <p className="text-sm text-zinc-500 max-w-xs mb-8">
                Ready to plan? Choose an action below:
            </p>

            <div className="grid grid-cols-2 gap-3 w-full px-4 max-w-md">
                <button
                    onClick={() => onSendMessage("Decompose the strategy into a detailed P0/P1 backlog.")}
                    className="flex flex-col gap-1 p-3 bg-zinc-900/50 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/50 rounded-md transition-all text-left group"
                >
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-emerald-400 flex items-center gap-2">
                        <Terminal className="h-3 w-3" /> Decompose Strategy
                    </span>
                </button>

                <button
                    onClick={() => onSendMessage("Identify likely technical risks and bottlenecks.")}
                    className="flex flex-col gap-1 p-3 bg-zinc-900/50 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/50 rounded-md transition-all text-left group"
                >
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-emerald-400 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" /> Risk Assessment
                    </span>
                </button>

                <button
                    onClick={() => onSendMessage("Create a step-by-step implementation roadmap.")}
                    className="col-span-2 flex flex-col gap-1 p-3 bg-zinc-900/50 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/50 rounded-md transition-all text-left group"
                >
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-emerald-400 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" /> Implementation Roadmap
                    </span>
                </button>
            </div>
        </div>
    );

    return (
        <UnifiedChatInterface
            title="Project Manager"
            icon={Terminal}
            messages={messages as Message[]}
            isProcessing={isProcessing}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onClear={onClear}
            className={className}
            emptyState={emptyState}
            headerActions={
                isProcessing ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 animate-pulse">
                        Thinking...
                    </span>
                ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider text-zinc-600 bg-zinc-900 border border-zinc-800">
                        Idle
                    </span>
                )
            }
            placeholder="Give instructions to the PM..."
        />
    );
}
