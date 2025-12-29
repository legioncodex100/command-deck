"use client";

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Zap, Database, Terminal as TermIcon, Trash2, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';

interface SubstructureChatProps {
    messages: { role: 'user' | 'model'; text: string; recommendation?: any }[]; // Matches state in parent
    input: string;
    setInput: (val: string) => void;
    isProcessing: boolean;
    complexity: ComplexityLevel;
    setComplexity: (val: ComplexityLevel) => void;
    onSend: (text: string) => void;
    onClear: () => void;
    onInit: () => void;
}

export function SubstructureChat({ messages, input, setInput, isProcessing, complexity, setComplexity, onSend, onClear, onInit }: SubstructureChatProps) {
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
        <div className="col-span-5 flex flex-col border-r border-zinc-900 bg-black relative overflow-hidden">
            <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <TermIcon className="h-4 w-4" /> Architect Console
                </div>
                <div className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${isProcessing ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-800'}`} />
                    <ComplexitySelector value={complexity} onChange={setComplexity} />
                    <button
                        onClick={onClear}
                        className="p-1.5 hover:bg-indigo-950/30 text-zinc-600 hover:text-red-500 rounded transition-colors group"
                        title="Clear Substructure Session"
                    >
                        <Trash2 className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
                        <div className="h-16 w-16 bg-indigo-900/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                            <Database className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-indigo-100 mb-2">Substructure</h3>
                        <p className="text-sm text-zinc-500 max-w-xs mb-8">
                            Define your database schema, relationships, and security policies.
                        </p>
                        <button
                            onClick={onInit}
                            className="group relative px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-widest uppercase rounded overflow-hidden transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Play className="h-3 w-3 fill-current" /> Initialize Session
                            </span>
                        </button>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 opacity-50">
                                {m.role === 'model' ? <div className="h-2 w-2 bg-indigo-500 rounded-full" /> : <div className="h-2 w-2 bg-zinc-700 rounded-full" />}
                                <span className="text-[9px] uppercase font-bold tracking-wider">{m.role === 'model' ? 'DB ARCHITECT' : 'PILOT'}</span>
                            </div>
                            <div className={`pl-4 border-l ${m.role === 'model' ? 'border-indigo-500/50 text-indigo-100/90' : 'border-zinc-700 text-zinc-400'} text-xs leading-relaxed whitespace-pre-wrap`}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="pl-1">{children}</li>,
                                        strong: ({ children }) => <strong className="text-indigo-400 font-bold">{children}</strong>,
                                        code: ({ children }) => <code className="bg-zinc-900 px-1 py-0.5 rounded text-indigo-300 font-mono text-xs">{children}</code>
                                    }}
                                >
                                    {m.text}
                                </ReactMarkdown>
                            </div>
                            {m.recommendation && (
                                <div className="ml-4 mt-2 mb-2 w-full max-w-sm bg-black border border-indigo-500/30 rounded overflow-hidden">
                                    <div className="bg-indigo-950/30 p-3 border-b border-indigo-500/20 flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-indigo-400" />
                                        <span className="text-indigo-400 uppercase text-[10px] font-bold tracking-widest">Decision Required</span>
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
                                                        ? 'bg-indigo-600/20 border-indigo-500 hover:bg-indigo-600/30'
                                                        : opt.recommended
                                                            ? 'bg-indigo-950/40 border-indigo-500/50 hover:bg-indigo-900/40'
                                                            : 'bg-transparent border-transparent hover:bg-indigo-900/10 hover:border-indigo-500/30'
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${isApprove ? 'border-indigo-400 bg-indigo-500' : opt.recommended ? 'border-indigo-400' : 'border-zinc-700 group-hover:border-indigo-500'
                                                        }`}>
                                                        {isApprove ? (
                                                            <CheckCircle2 className="h-3 w-3 text-black" />
                                                        ) : (
                                                            <div className={`h-2 w-2 rounded-full bg-indigo-500 transition-opacity ${opt.recommended ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                                }`} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className={`text-xs font-bold transition-colors ${isApprove ? 'text-white' : opt.recommended ? 'text-indigo-300' : 'text-zinc-300 group-hover:text-indigo-300'
                                                                }`}>{opt.label}</div>
                                                            {opt.recommended && !isApprove && (
                                                                <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                                                    Recommended
                                                                </span>
                                                            )}
                                                        </div>
                                                        {opt.description && <div className={`text-[10px] ${isApprove ? 'text-indigo-200' : opt.recommended ? 'text-indigo-500/80' : 'text-zinc-600 group-hover:text-indigo-500/70'
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
                {isProcessing && <div className="text-xs text-indigo-500/50 animate-pulse font-mono px-4">Architect is thinking...</div>}
                <div ref={scrollRef} />
            </div>

            {/* Suggestion Lifeline */}
            {messages.length > 0 && messages[messages.length - 1].role === 'model' && !messages[messages.length - 1].recommendation && (
                <div className="px-4 py-2 bg-black flex justify-end animate-fadeIn">
                    <button
                        onClick={() => onSend("I'm not sure. What do you recommend for this schema design?")}
                        className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>Ask for Recommendation</span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                <div className="relative flex items-end gap-2 bg-zinc-900/50 border border-zinc-800 rounded p-1 focus-within:border-indigo-500/50 transition-colors">
                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent p-2 text-xs text-indigo-100 placeholder-zinc-700 focus:outline-none resize-none max-h-[200px] min-h-[36px] scrollbar-thin scrollbar-thumb-zinc-700 font-mono"
                        placeholder="Refine schema..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                        rows={1}
                    />
                    <button onClick={() => onSend(input)} className="p-2 text-zinc-600 hover:text-indigo-500 mb-0.5">
                        <Send className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
