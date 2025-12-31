"use client";

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Zap, Terminal, Trash2, Play, Sparkles, CheckCircle2, User, Bot } from 'lucide-react';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody } from '../ui';
import { usePillarTheme } from '../PillarProvider';

interface StrategyChatProps {
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

export function StrategyChat({ messages, input, setInput, isProcessing, complexity, setComplexity, onSend, onClear, onInit, className }: StrategyChatProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const theme = usePillarTheme();

    const handleSubmit = () => {
        if (!input.trim() || isProcessing) return;
        onSend(input);
    };

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
            handleSubmit();
        }
    };

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={Terminal}
                title="Architect Terminal"
                actions={
                    <div className="flex items-center gap-3">
                        <ComplexitySelector value={complexity} onChange={setComplexity} />
                        <button
                            onClick={onClear}
                            className="p-1.5 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded transition-colors group"
                            title="Clear Strategy Session"
                        >
                            <Trash2 className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                        </button>
                    </div>
                }
            />

            <PillarBody>
                <div className="p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
                            <div className={`h-16 w-16 ${theme.iconBg} rounded-full flex items-center justify-center mb-6 border ${theme.border}`}>
                                <Terminal className={`h-8 w-8 ${theme.text}`} />
                            </div>
                            <h3 className={`text-xl font-bold ${theme.text.replace('400', '100')} mb-2`}>Strategy Room</h3>
                            <p className="text-sm text-zinc-500 max-w-xs mb-8">
                                Consult with the Systems Architect to define technical pillars based on your PRD.
                            </p>
                            <button
                                onClick={onInit}
                                className={`group relative px-6 py-3 ${theme.text.replace('text-', 'bg-').replace('400', '600')} hover:${theme.text.replace('text-', 'bg-').replace('400', '500')} text-black font-bold text-sm tracking-widest uppercase rounded overflow-hidden transition-all hover:scale-105 active:scale-95`}
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
                                    {m.role === 'model' ? <Terminal className={`h-3 w-3 ${theme.text}`} /> : <User className="h-3 w-3 text-zinc-400" />}
                                    <span className="text-[10px] uppercase font-bold tracking-wider">{m.role === 'model' ? 'SYSTEMS ARCHITECT' : 'PILOT'}</span>
                                </div>
                                <div className={`pl-4 border-l ${m.role === 'model' ? `${theme.border.replace('/20', '/50')} ${theme.text.replace('400', '100')}` : 'border-zinc-700 text-zinc-400'} text-sm leading-relaxed whitespace-pre-wrap`}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                            li: ({ children }) => <li className="pl-1">{children}</li>,
                                            strong: ({ children }) => <strong className={`${theme.text} font-bold`}>{children}</strong>,
                                            code: ({ children }) => <code className={`bg-zinc-900 px-1 py-0.5 rounded ${theme.text.replace('400', '300')} font-mono text-xs`}>{children}</code>
                                        }}
                                    >
                                        {m.text}
                                    </ReactMarkdown>
                                </div>
                                {m.recommendation && (
                                    <div className={`ml-4 mt-2 mb-4 w-full max-w-sm bg-black border ${theme.border} rounded overflow-hidden`}>
                                        <div className={`${theme.bg} p-3 border-b ${theme.border} flex items-center gap-2`}>
                                            <Zap className={`h-3 w-3 ${theme.text}`} />
                                            <span className={`${theme.text} uppercase text-[10px] font-bold tracking-widest`}>Decision Required</span>
                                        </div>
                                        {m.recommendation.context && (
                                            <div className="p-3 text-xs text-zinc-400 border-b border-zinc-800/50 bg-zinc-900/20 italic">
                                                {m.recommendation.context}
                                            </div>
                                        )}
                                        <div className="p-2 space-y-1">
                                            {m.recommendation.options.map((opt: any) => {
                                                const isApprove = ['APPROVE', 'CONFIRM', 'YES'].includes(opt.id);
                                                // Dynamic colors for recommended/approved states
                                                const activeColor = theme.text.split('-')[1]; // e.g. emerald

                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => onSend(isApprove ? "APPROVED. Proceed." : `Decision: ${opt.label}`)}
                                                        className={cn(
                                                            "w-full text-left p-3 rounded group border transition-all flex items-start gap-3",
                                                            isApprove
                                                                ? `bg-${activeColor}-600/20 border-${activeColor}-500 hover:bg-${activeColor}-600/30`
                                                                : opt.recommended
                                                                    ? `bg-${activeColor}-950/40 border-${activeColor}-500/50 hover:bg-${activeColor}-900/40`
                                                                    : `bg-transparent border-transparent hover:bg-${activeColor}-900/10 hover:border-${activeColor}-500/30`
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                                                            isApprove
                                                                ? `border-${activeColor}-400 bg-${activeColor}-500`
                                                                : opt.recommended
                                                                    ? `border-${activeColor}-400`
                                                                    : `border-zinc-700 group-hover:border-${activeColor}-500`
                                                        )}>
                                                            {isApprove ? (
                                                                <CheckCircle2 className="h-3 w-3 text-black" />
                                                            ) : (
                                                                <div className={cn(
                                                                    `h-2 w-2 rounded-full bg-${activeColor}-500 transition-opacity`,
                                                                    opt.recommended ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                                )} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div className={cn(
                                                                    "text-xs font-bold transition-colors",
                                                                    isApprove ? 'text-white' : opt.recommended ? `text-${activeColor}-300` : `text-zinc-300 group-hover:text-${activeColor}-300`
                                                                )}>{opt.label}</div>
                                                                {opt.recommended && !isApprove && (
                                                                    <span className={`text-[9px] uppercase font-bold tracking-wider text-${activeColor}-500 bg-${activeColor}-500/10 px-1.5 py-0.5 rounded border border-${activeColor}-500/20`}>
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {opt.description && <div className={cn(
                                                                "text-[10px]",
                                                                isApprove ? `text-${activeColor}-200` : opt.recommended ? `text-${activeColor}-500/80` : `text-zinc-600 group-hover:text-${activeColor}-500/70`
                                                            )}>{opt.description}</div>}
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
                    {isProcessing && <div className={`pl-5 text-sm ${theme.textDim} animate-pulse`}>Computing architecture...</div>}
                    <div ref={scrollRef} />
                </div>

                {/* Suggestion Lifeline */}
                {messages.length > 0 && messages[messages.length - 1].role === 'model' && !messages[messages.length - 1].recommendation && (
                    <div className="px-4 py-2 bg-black flex justify-end animate-fadeIn shrink-0">
                        <button
                            onClick={() => onSend("I'm not sure. What do you recommend based on the system architecture?")}
                            className={`text-xs ${theme.text} hover:${theme.text.replace('400', '300')} flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity`}
                        >
                            <Sparkles className="h-3 w-3" />
                            <span>Ask for Recommendation</span>
                        </button>
                    </div>
                )}
            </PillarBody>

            {/* Input Area */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-950 shrink-0">
                <div className="flex gap-2 items-end">
                    <span className={`${theme.text} font-bold pt-3 pb-3 text-xs`}>{">"}</span>
                    <textarea
                        ref={textareaRef}
                        className={`flex-1 bg-transparent text-sm ${theme.text.replace('400', '100')} placeholder-zinc-700 focus:outline-none resize-none pt-2.5 pb-2.5 max-h-[200px] min-h-[44px] scrollbar-thin scrollbar-thumb-zinc-700`}
                        rows={1}
                        placeholder="Enter directive..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                    />
                    <button onClick={handleSubmit} className={`text-zinc-600 hover:${theme.text} mb-2`}>
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </PillarPanel>
    );
}
