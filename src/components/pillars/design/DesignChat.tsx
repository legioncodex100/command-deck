"use client";

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, Terminal, Trash2, MessageSquare } from 'lucide-react';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { cn } from '@/lib/utils';

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
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Auto-resize textarea
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
        <div className={cn("flex flex-col border-r border-zinc-900 bg-black relative overflow-hidden", className)}>
            <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Terminal className="h-4 w-4" /> UX Console
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
                        <div className="h-16 w-16 bg-indigo-900/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                            <Sparkles className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-indigo-100 mb-2">Design Studio</h3>
                        <button onClick={onInit} className="group relative px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-widest uppercase rounded">
                            Initialize Session
                        </button>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 opacity-50">
                                {m.role === 'model' ? <MessageSquare className="h-3 w-3 text-indigo-500" /> : <div className="h-3 w-3 bg-zinc-700 rounded-full" />}
                                <span className="text-[10px] uppercase font-bold tracking-wider">{m.role === 'model' ? 'UX CONSULTANT' : 'USER'}</span>
                            </div>
                            <div className={`pl-4 border-l ${m.role === 'model' ? 'border-indigo-500/50 text-indigo-100/90' : 'border-zinc-700 text-zinc-400'} text-xs leading-relaxed whitespace-pre-wrap`}>
                                <ReactMarkdown>{m.text}</ReactMarkdown>
                            </div>
                            {/* Decision Cards */}
                            {m.recommendation && (
                                <div className="ml-4 mt-2 mb-2 w-full max-w-sm bg-black border border-indigo-500/30 rounded overflow-hidden">
                                    <div className="p-2 border-b border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/30">
                                        Decision Required
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {m.recommendation.options.map((opt: any) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => onSend(`Selected: ${opt.label}`)}
                                                className={`w-full text-left p-2 rounded text-[10px] border ${opt.recommended ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-200' : 'border-zinc-800 hover:border-indigo-500/30 text-zinc-500 hover:text-indigo-300'}`}
                                            >
                                                <div className="font-bold mb-0.5">{opt.label}</div>
                                                <div className="opacity-70">{opt.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                <div className="relative flex items-end gap-2 bg-zinc-900/50 border border-zinc-800 rounded p-1 focus-within:border-indigo-500/50">
                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent p-2 text-xs text-indigo-100 placeholder-zinc-700 focus:outline-none resize-none max-h-[200px] min-h-[36px]"
                        placeholder="Discuss design..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                        rows={1}
                    />
                    <button onClick={() => onSend(input)} className="p-2 text-zinc-600 hover:text-indigo-500"><Send className="h-3 w-3" /></button>
                </div>
            </div>
        </div>
    );
}
