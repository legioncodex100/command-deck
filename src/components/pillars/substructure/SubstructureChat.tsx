"use client";

import React from 'react';
import { Database, Terminal as TermIcon, Play } from 'lucide-react';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { UnifiedChatInterface, Message } from '../ui/UnifiedChatInterface';
import { usePillarTheme } from '../PillarProvider';

interface SubstructureChatProps {
    messages: { role: 'user' | 'model'; text: string; recommendation?: any }[];
    input: string;
    setInput: (val: string) => void;
    isProcessing: boolean;
    complexity: ComplexityLevel;
    setComplexity: (val: ComplexityLevel) => void;
    onSend: (text: string) => void;
    onClear: () => void;
    onInit: () => void;
    className?: string; // StandardPillarLayout prop
}

export function SubstructureChat({ messages, input, setInput, isProcessing, complexity, setComplexity, onSend, onClear, onInit, className }: SubstructureChatProps) {
    const theme = usePillarTheme();

    // Use theme.color for the pulse indicator based on theme if needed, or stick to emerald as per original if it was hardcoded or theme usage?
    // Original used: ${isProcessing ? `${theme.bg.replace('/20', '')} animate-pulse` : 'bg-zinc-800'}`
    // theme.bg is usually `bg-emerald-500/20` so `bg-emerald-500`

    const pulseColor = isProcessing ? (theme.bg ? theme.bg.replace('/20', '') : 'bg-emerald-500') : 'bg-zinc-800';

    const emptyState = (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
            <div className="h-16 w-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <Database className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-100 mb-2">Substructure</h3>
            <p className="text-sm text-zinc-500 max-w-xs mb-8">
                Define your database schema, relationships, and security policies.
            </p>
            <button
                onClick={onInit}
                className="group relative px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-sm tracking-widest uppercase rounded overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Play className="h-3 w-3 fill-current" /> Initialize Session
                </span>
            </button>
        </div>
    );

    return (
        <UnifiedChatInterface
            title="Architect Console"
            icon={TermIcon}
            messages={messages as Message[]}
            isProcessing={isProcessing}
            input={input}
            setInput={setInput}
            onSend={onSend}
            onClear={onClear}
            className={className}
            emptyState={emptyState}
            headerActions={
                <div className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${pulseColor} ${isProcessing ? 'animate-pulse' : ''}`} />
                    <div className="hidden lg:block">
                        <ComplexitySelector value={complexity} onChange={setComplexity} />
                    </div>
                </div>
            }
            placeholder="Refine schema..."
        />
    );
}
