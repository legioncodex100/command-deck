"use client";

import React from 'react';
import { Terminal, Sparkles, Play } from 'lucide-react';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { UnifiedChatInterface, Message } from '../ui/UnifiedChatInterface';

interface DiscoveryChatProps {
    messages: { role: 'user' | 'model'; text: string; recommendation?: any }[]; // Match Core Message type?
    input: string;
    setInput: (val: string) => void;
    isProcessing: boolean;
    complexity: ComplexityLevel;
    setComplexity: (val: ComplexityLevel) => void;
    onSend: (text: string) => void;
    onClear: () => void;
    className?: string;
}

export function DiscoveryChat({ messages, input, setInput, isProcessing, complexity, setComplexity, onSend, onClear, className }: DiscoveryChatProps) {
    const emptyState = (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
            <div className="h-16 w-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <Sparkles className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-100 mb-2">Discovery Lab</h3>
            <p className="text-sm text-zinc-500 max-w-xs mb-8">
                Initialize the Socratic Engine to define your product vision, audience, and core logic.
            </p>
            <button
                onClick={() => onSend("Initialize Protocol. \n\n1. WELCOME: Introduce yourself as the Senior Business Analyst.\n2. JOB SUMMARY: Briefly explain your role in extracting the PRD.\n3. DECISION: Immediately present a 'Project Type' decision card with options: 'Website', 'Web App', 'Ecommerce', 'Mobile App', 'SaaS Platform', 'Game', 'Client Choice (Free Text)'.")}
                className="group relative px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-sm tracking-widest uppercase rounded overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Play className="h-3 w-3 fill-current" /> Initialize Session
                </span>
            </button>
        </div>
    );

    const SuggestionLifeline = messages.length > 0 && messages[messages.length - 1].role === 'model' && !messages[messages.length - 1].recommendation ? (
        <div className="px-4 py-2 bg-black flex justify-end animate-fadeIn shrink-0 absolute bottom-20 right-0 z-20 pointer-events-none">
            {/* Note: Absolute positioning logic might conflict with UnifiedChatInterface internal scrolling. UnifiedChatInterface renders body content. 
                 Ideally, 'headerActions' or passing a custom footer element would be better. 
                 But UnifiedChatInterface expects specific props.
                 I'll omit the lifeline for now or implement "BottomOverlay" prop in Unified later if needed.
                 Wait, the lifeline was just a suggestion button. 
                 I can pass it as part of 'emptyState' (no) or just append it to message list? No.
                 Let's skip it for now or assume UnifiedChat handles it?
                 Actually, UnifiedChatInterface doesn't support "floating" elements easily yet. 
                 I will just omit it for simplicity as user requested "standardization" and that lifeline was unique to them.
                 OR I can insert it as a fake message? No.
             */}
        </div>
    ) : null;

    return (
        <UnifiedChatInterface
            title="Socratic Interface"
            icon={Terminal}
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
            placeholder="Describe your product vision..."
        />
    );
}
