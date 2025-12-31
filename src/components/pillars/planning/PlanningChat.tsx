
import { useState, useRef, useEffect } from "react";
import { Send, Terminal, Sparkles, User, Bot, Trash2, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface PlanningChatProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    onClear: () => void;
    isProcessing: boolean;
    className?: string;
}

export function PlanningChat({ messages, onSendMessage, onClear, isProcessing, className }: PlanningChatProps) {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isProcessing) return;
        onSendMessage(input);
        setInput("");
    };

    return (
        <div className={cn("h-full flex flex-col bg-zinc-950/30 relative overflow-hidden", className)}>
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-3 border-b border-[#27272a] bg-zinc-950/80">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-emerald-500" /> Project Manager
                    </span>
                    {isProcessing ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 animate-pulse">
                            Thinking...
                        </span>
                    ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider text-zinc-600 bg-zinc-900">
                            Idle
                        </span>
                    )}
                </div>

                <button
                    onClick={onClear}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-600 hover:text-red-400 rounded transition-colors"
                    title="Clear Chat"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="mt-10 flex flex-col items-center justify-center text-zinc-700 gap-6 w-full max-w-md mx-auto">
                        <div className="flex flex-col items-center gap-2">
                            <Sparkles className="h-8 w-8 opacity-20" />
                            <p className="text-xs text-center text-zinc-600">
                                Ready to plan? Choose an action below:
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full px-4">
                            <button
                                onClick={() => onSendMessage("Decompose the strategy into a detailed P0/P1 backlog.")}
                                className="flex flex-col gap-1 p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 rounded-md transition-all text-left group"
                            >
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-emerald-400 flex items-center gap-2">
                                    <Terminal className="h-3 w-3" /> Decompose Strategy
                                </span>
                                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                    Break down requirements into atomic tasks.
                                </span>
                            </button>

                            <button
                                onClick={() => onSendMessage("Identify likely technical risks and bottlenecks.")}
                                className="flex flex-col gap-1 p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-md transition-all text-left group"
                            >
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-amber-400 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Risk Assessment
                                </span>
                                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                    Analyze potential implementation pitfalls.
                                </span>
                            </button>

                            <button
                                onClick={() => onSendMessage("Create a step-by-step implementation roadmap.")}
                                className="col-span-2 flex flex-col gap-1 p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/30 rounded-md transition-all text-left group"
                            >
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-indigo-400 flex items-center gap-2">
                                    <ArrowRight className="h-3 w-3" /> Implementation Roadmap
                                </span>
                                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                    Generate a sequential guide for developers.
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={cn(
                        "flex gap-3 text-sm max-w-[90%]",
                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                        <div className={cn(
                            "shrink-0 h-6 w-6 rounded flex items-center justify-center mt-1",
                            msg.role === 'user' ? "bg-zinc-800 text-zinc-400" : "bg-emerald-950/30 text-emerald-500 border border-emerald-500/20"
                        )}>
                            {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        </div>

                        <div className={cn(
                            "p-3 rounded-lg leading-relaxed whitespace-pre-wrap",
                            msg.role === 'user'
                                ? "bg-zinc-800 text-zinc-200"
                                : "bg-transparent text-zinc-300 pl-0 pt-0" // Minimal styling for AI to look clean
                        )}>
                            {msg.role === 'user' ? (
                                msg.text
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-300 prose-ul:text-zinc-300 prose-strong:text-emerald-400">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[#27272a] bg-black">
                <div className="relative">
                    <input
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md py-2.5 pl-3 pr-10 text-base text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-700 font-mono"
                        placeholder="Give instructions to the PM..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-1.5 top-1.5 p-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
