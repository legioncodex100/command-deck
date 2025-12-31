"use client";

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Trash2, Zap, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody } from './index';
import { usePillarTheme } from '../PillarProvider';

export interface Message {
    role: 'user' | 'model';
    text: string;
    recommendation?: any;
}

export interface UnifiedChatInterfaceProps {
    title: string;
    icon: LucideIcon;
    subtitle?: string;

    // Core Data
    messages: Message[];
    isProcessing: boolean;

    // Actions
    input: string;
    setInput: (val: string) => void;
    onSend: (text: string) => void;
    onClear?: () => void;
    disabled?: boolean;

    // Customization
    headerActions?: React.ReactNode;
    emptyState?: React.ReactNode;
    placeholder?: string;
    className?: string; // Wrapper className

    // Custom Renderers
    renderDecisionCard?: (recommendation: any) => React.ReactNode;
}

export function UnifiedChatInterface({
    title, icon, subtitle,
    messages, isProcessing,
    input, setInput, onSend, onClear, disabled,
    headerActions, emptyState, placeholder = "Type your message...",
    className,
    renderDecisionCard
}: UnifiedChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const theme = usePillarTheme(); // Returns { ...classes, color: 'emerald' }

    // Use theme.color safely. If undefined, fallback to 'emerald' (though current implementation guarantees it)
    const themeColor = theme.color || 'emerald';

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
            if (input.trim() && !isProcessing && !disabled) {
                onSend(input);
            }
        }
    };

    return (
        <PillarPanel className={cn("bg-black border-r border-zinc-800", className)}>
            <PillarHeader
                icon={icon}
                title={title}
                subtitle={subtitle}
                actions={
                    <div className="flex items-center gap-3">
                        {headerActions}
                        {onClear && (
                            <button
                                onClick={onClear}
                                className="p-1.5 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded transition-colors group"
                                title="Clear Chat"
                            >
                                <Trash2 className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                            </button>
                        )}
                    </div>
                }
            />

            <PillarBody>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 absolute inset-0">
                    {messages.length === 0 ? (
                        emptyState || (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                                <span className="text-sm">No messages yet.</span>
                            </div>
                        )
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-lg text-sm leading-relaxed border ${m.role === 'user'
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
                                    : `bg-${themeColor}-950/10 border-${themeColor}-500/20 text-${themeColor}-50/80 shadow-[0_0_15px_rgba(16,185,129,0.05)]`
                                    }`}>
                                    {m.role === 'user' ? (
                                        m.text
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                                li: ({ children }) => <li className="pl-1">{children}</li>,
                                                strong: ({ children }) => <strong className={`text-${themeColor}-400 font-bold`}>{children}</strong>,
                                                code: ({ children }) => <code className={`bg-zinc-900 px-1 py-0.5 rounded text-${themeColor}-300 font-mono text-xs`}>{children}</code>
                                            }}
                                        >
                                            {m.text}
                                        </ReactMarkdown>
                                    )}
                                </div>

                                {(m.recommendation && !renderDecisionCard) && (
                                    <div className={`mt-2 w-full max-w-sm bg-black border border-${themeColor}-500/30 rounded overflow-hidden`}>
                                        <div className={`bg-${themeColor}-950/30 p-3 border-b border-${themeColor}-500/20 flex items-center gap-2`}>
                                            <Zap className={`h-3 w-3 text-${themeColor}-400`} />
                                            <span className={`text-${themeColor}-400 uppercase text-[10px] font-bold tracking-widest`}>Decision Required</span>
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
                                                            ? `bg-${themeColor}-600/20 border-${themeColor}-500 hover:bg-${themeColor}-600/30`
                                                            : opt.recommended
                                                                ? `bg-${themeColor}-950/40 border-${themeColor}-500/50 hover:bg-${themeColor}-900/40`
                                                                : `bg-transparent border-transparent hover:bg-${themeColor}-900/10 hover:border-${themeColor}-500/30`
                                                            }`}
                                                    >
                                                        <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${isApprove ? `border-${themeColor}-400 bg-${themeColor}-500` : opt.recommended ? `border-${themeColor}-400` : `border-zinc-700 group-hover:border-${themeColor}-500`
                                                            }`}>
                                                            {isApprove ? (
                                                                <div className="h-3 w-3 text-black font-bold flex items-center justify-center">✓</div>
                                                            ) : (
                                                                <div className={`h-2 w-2 rounded-full bg-${themeColor}-500 transition-opacity ${opt.recommended ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                                    }`} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div className={`text-xs font-bold transition-colors ${isApprove ? 'text-white' : opt.recommended ? `text-${themeColor}-300` : `text-zinc-300 group-hover:text-${themeColor}-300`
                                                                    }`}>{opt.label}</div>
                                                                {opt.recommended && !isApprove && (
                                                                    <span className={`text-[9px] uppercase font-bold tracking-wider text-${themeColor}-500 bg-${themeColor}-500/10 px-1.5 py-0.5 rounded border border-${themeColor}-500/20`}>
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {opt.description && <div className={`text-[10px] ${isApprove ? `text-${themeColor}-200` : opt.recommended ? `text-${themeColor}-500/80` : `text-zinc-600 group-hover:text-${themeColor}-500/70`
                                                                }`}>{opt.description}</div>}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {m.recommendation && renderDecisionCard && renderDecisionCard(m.recommendation)}
                            </div>
                        ))
                    )}
                    {isProcessing && (
                        <div className={`text-xs text-${themeColor}-500/50 animate-pulse font-mono px-4`}>
                            Thinking...
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </PillarBody>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950 shrink-0 z-10 relative">
                <div className={`relative bg-zinc-950 border border-zinc-800 rounded-lg focus-within:border-${themeColor}-500/50 transition-colors flex items-end`}>
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent p-3 pr-12 text-sm focus:outline-none resize-none max-h-[200px] min-h-[44px] lg:min-h-[44px] py-3 lg:py-3 scrollbar-thin scrollbar-thumb-zinc-700"
                        placeholder={placeholder}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing || disabled}
                        rows={1}
                    />
                    <button
                        onClick={() => { if (input.trim() && !isProcessing && !disabled) onSend(input); }}
                        disabled={!input.trim() || isProcessing || disabled}
                        className={`absolute right-2 bottom-2 p-1.5 text-${themeColor}-500 hover:text-${themeColor}-400 hover:bg-${themeColor}-950/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </PillarPanel>
    );
}
