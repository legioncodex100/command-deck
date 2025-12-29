"use client";

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Zap, Activity, Terminal, Trash2, Play, CheckCircle2, Sparkles } from 'lucide-react';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';

interface DiscoveryChatProps {
    messages: { role: 'user' | 'model'; text: string; recommendation?: any }[];
    input: string;
    setInput: (val: string) => void;
    isProcessing: boolean;
    complexity: ComplexityLevel;
    setComplexity: (val: ComplexityLevel) => void;
    onSend: (text: string) => void;
    onClear: () => void;
}

export function DiscoveryChat({ messages, input, setInput, isProcessing, complexity, setComplexity, onSend, onClear }: DiscoveryChatProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend(input);
        }
    };

    return (
        <div className="col-span-5 flex flex-col border-r border-zinc-800 bg-black relative overflow-hidden">
            <header className="flex items-center justify-between p-3 border-b border-zinc-900 bg-zinc-950/50">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2">
                    <Terminal className="h-4 w-4" /> Socratic Interface
                </div>
                <div className="flex items-center gap-3">
                    <ComplexitySelector value={complexity} onChange={setComplexity} />
                    <button
                        onClick={onClear}
                        className="p-1.5 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded transition-colors group"
                        title="Clear Session"
                    >
                        <Trash2 className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
                {messages.length === 0 ? (
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
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-lg text-sm leading-relaxed border ${m.role === 'user'
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
                                : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-50/80 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                                }`}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="pl-1">{children}</li>,
                                        strong: ({ children }) => <strong className="text-emerald-400 font-bold">{children}</strong>,
                                    }}
                                >
                                    {m.text}
                                </ReactMarkdown>
                            </div>
                            {m.recommendation && (
                                <div className="mt-2 w-full max-w-sm bg-black border border-emerald-500/30 rounded overflow-hidden">
                                    <div className="bg-emerald-950/30 p-3 border-b border-emerald-500/20 flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-emerald-400" />
                                        <span className="text-emerald-400 uppercase text-[10px] font-bold tracking-widest">Decision Required</span>
                                    </div>
                                    {m.recommendation.context && (
                                        <div className="p-3 text-xs text-zinc-400 border-b border-zinc-800/50 bg-zinc-900/20 italic">
                                            {m.recommendation.context}
                                        </div>
                                    )}
                                    <div className="p-2 space-y-1">
                                        {m.recommendation.options.map((opt: any) => {
                                            const isApprove = ['APPROVE', 'CONFIRM', 'YES'].includes(opt.id);
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => onSend(isApprove ? "APPROVED. Proceed." : `Decision: ${opt.label}`)}
                                                    className={`w-full text-left p-3 rounded group border transition-all flex items-start gap-3 ${isApprove
                                                        ? 'bg-emerald-600/20 border-emerald-500 hover:bg-emerald-600/30'
                                                        : opt.recommended
                                                            ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-900/40'
                                                            : 'bg-transparent border-transparent hover:bg-emerald-900/10 hover:border-emerald-500/30'
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${isApprove ? 'border-emerald-400 bg-emerald-500' : opt.recommended ? 'border-emerald-400' : 'border-zinc-700 group-hover:border-emerald-500'
                                                        }`}>
                                                        {isApprove ? (
                                                            <CheckCircle2 className="h-3 w-3 text-black" />
                                                        ) : (
                                                            <div className={`h-2 w-2 rounded-full bg-emerald-500 transition-opacity ${opt.recommended ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                                }`} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className={`text-xs font-bold transition-colors ${isApprove ? 'text-white' : opt.recommended ? 'text-emerald-300' : 'text-zinc-300 group-hover:text-emerald-300'
                                                                }`}>{opt.label}</div>
                                                            {opt.recommended && !isApprove && (
                                                                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                                    Recommended
                                                                </span>
                                                            )}
                                                        </div>
                                                        {opt.description && <div className={`text-[10px] ${isApprove ? 'text-emerald-200' : opt.recommended ? 'text-emerald-500/80' : 'text-zinc-600 group-hover:text-emerald-500/70'
                                                            }`}>{opt.description}</div>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isProcessing && <div className="text-xs text-emerald-500/50 animate-pulse font-mono px-4">Analyst is thinking...</div>}
                <div ref={scrollRef} />
            </div>

            {/* Suggestion Lifeline */}
            {messages.length > 0 && messages[messages.length - 1].role === 'model' && !messages[messages.length - 1].recommendation && (
                <div className="px-4 py-2 bg-black flex justify-end animate-fadeIn">
                    <button
                        onClick={() => onSend("I'm not sure. What do you recommend based on best practices?")}
                        className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>Ask for Recommendation</span>
                    </button>
                </div>
            )}

            <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                <div className="relative bg-zinc-950 border border-zinc-800 rounded-lg focus-within:border-emerald-500/50 transition-colors flex items-end">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent p-3 pr-12 text-sm focus:outline-none resize-none max-h-[200px] min-h-[44px] scrollbar-thin scrollbar-thumb-zinc-700"
                        placeholder="Describe your product vision..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                        rows={1}
                    />
                    <button
                        onClick={() => onSend(input)}
                        className="absolute right-2 bottom-2 p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30 rounded transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
