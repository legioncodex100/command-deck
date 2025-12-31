"use client";

import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { UnifiedChatInterface, Message } from '../ui/UnifiedChatInterface';

interface DesignChatProps {
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

export function DesignChat({
    messages, input, setInput, isProcessing,
    complexity, setComplexity, onSend, onClear, onInit,
    className
}: DesignChatProps) {
    const emptyState = (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
            <div className="h-16 w-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <Sparkles className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-100 mb-2">Design Studio</h3>
            <p className="text-sm text-zinc-500 max-w-xs mb-8">
                Refine your user experience, visual language, and interaction patterns.
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
            title="UX Console"
            icon={Sparkles}
            messages={messages as Message[]}
            isProcessing={isProcessing}
            input={input}
            setInput={setInput}
            onSend={onSend}
            onClear={onClear}
            className={className}
            emptyState={emptyState}
            headerActions={
                <div className="hidden lg:block">
                    <ComplexitySelector value={complexity} onChange={setComplexity} />
                </div>
            }
            placeholder="Discuss design..."
        />
    );
}
