'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, RefreshCw } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    recommendation?: {
        title: string;
        options: any[]; // Using any to avoid duplicating full interface here for now, or import it
    };
}

interface AgentBuilderChatProps {
    agentName: string;
    systemPrompt: string;
    onUpdatePrompt: (newPrompt: string) => void;
    onUpdateConfig?: (updates: any) => void; // Added robust handler
}

export default function AgentBuilderChat({ agentName, systemPrompt, onUpdatePrompt, onUpdateConfig }: AgentBuilderChatProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-1',
            role: 'assistant',
            content: `Greetings, Commander. I am the Personnel Director.\n\nI can help you design the neural matrix for **${agentName || 'this unit'}**.\n\nTell me what role you need filled, or describe the personality you want to synthesize.`,
            timestamp: Date.now()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
            role: 'user',
            content: textToSend,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Import dynamically to avoid server-module issues in client? 
            // Next.js handles server actions fine usually.
            const { consultPersonnelDirector } = await import('@/app/actions/director');

            // Construct history for context
            const history = messages.concat(userMsg).map(m => ({
                role: m.role,
                content: m.content
            }));

            // Current Draft State (We need to pass this in prop really, but for now lets just pass empty or minimal)
            // Ideally we need the parent to pass the full 'formData'. 
            // Let's rely on the text context for now or update props.
            // Wait! We definitely need the current prompt context.
            // Let's assume the parent passes 'agentName' and 'systemPrompt' which are the text fields.
            const currentDraft = {
                name: agentName,
                system_prompt: systemPrompt
            };

            const response = await consultPersonnelDirector(history, currentDraft);

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                timestamp: Date.now(),
                recommendation: response.consultant_recommendation
            }]);

            if (response.suggested_updates) {
                // Apply System Prompt
                if (response.suggested_updates.system_prompt) {
                    onUpdatePrompt(response.suggested_updates.system_prompt);
                }

                // Apply Full Config (Model, Name, etc) if handler exists
                if (onUpdateConfig) {
                    onUpdateConfig(response.suggested_updates);
                }
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Connection to Director lost.",
                timestamp: Date.now()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-lg border border-white/5 overflow-hidden relative">

            {/* Header / Mode Switcher (Future) */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                {/* <div className="text-[10px] text-emerald-600 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                    MODE: DIRECTOR
                </div> */}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
                            {msg.role === 'user' ? <User size={14} className="text-zinc-400" /> : <Bot size={14} className="text-emerald-400" />}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm font-mono leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                            ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                            : 'bg-black/40 text-emerald-100/90 border border-emerald-900/30'
                            }`}>
                            {msg.content}

                            {/* DECISION CARD */}
                            {msg.recommendation && (
                                <div className="mt-4 bg-black/60 border border-emerald-900/50 rounded-lg overflow-hidden">
                                    <div className="bg-emerald-950/30 px-3 py-2 border-b border-emerald-900/50 flex items-center gap-2">
                                        <Sparkles size={16} className="text-emerald-400" />
                                        <span className="text-sm font-bold text-emerald-100 uppercase tracking-wider">{msg.recommendation.title}</span>
                                    </div>
                                    <div className="p-2 space-y-2">
                                        {msg.recommendation.options.map((opt: any) => (
                                            <div
                                                key={opt.id}
                                                onClick={() => handleSend(`Selected Option: ${opt.label}`)}
                                                className={`group relative p-3 rounded border cursor-pointer transition-all hover:bg-emerald-900/10 ${opt.recommended
                                                    ? 'border-emerald-500/50 bg-emerald-900/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                    : 'border-zinc-800 hover:border-emerald-500/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-sm font-bold ${opt.recommended ? 'text-emerald-400' : 'text-zinc-300 group-hover:text-emerald-300'}`}>
                                                        {opt.label}
                                                    </span>
                                                    {opt.recommended && (
                                                        <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                                            Recommended
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-400 leading-snug mb-2">{opt.description}</p>

                                                {/* Pros/Cons Mini-Grid */}
                                                <div className="grid grid-cols-2 gap-3 text-[11px]">
                                                    {opt.pros && opt.pros.length > 0 && (
                                                        <div>
                                                            <span className="text-emerald-500 font-bold block mb-1">PROS</span>
                                                            <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">
                                                                {opt.pros.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {opt.cons && opt.cons.length > 0 && (
                                                        <div>
                                                            <span className="text-red-400/80 font-bold block mb-1">CONS</span>
                                                            <ul className="list-disc pl-4 text-zinc-500 space-y-0.5">
                                                                {opt.cons.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center border bg-emerald-900/20 border-emerald-500/30">
                            <Bot size={14} className="text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-1 h-8 px-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950 border-t border-white/5 absolute bottom-0 left-0 right-0">
                <div className="relative flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Describe the agent's role or personality..."
                        className="w-full bg-black border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                        autoFocus
                    />
                    <button
                        onClick={() => handleSend()}
                        className="absolute right-2 p-2 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900/20 rounded transition-colors"
                    >
                        {isTyping ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
                <div className="text-[10px] text-zinc-600 mt-2 font-mono flex justify-between px-1">
                    <span>STATUS: LINKED</span>
                    <span>PERSONNEL DIRECTOR v1.0</span>
                </div>
            </div>

        </div>
    );
}
