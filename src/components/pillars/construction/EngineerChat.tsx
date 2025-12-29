
import { Bot, Send, Terminal, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState } from "react";

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface EngineerChatProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    enabled: boolean;
    bottomRef?: React.RefObject<HTMLDivElement>;
}

export function EngineerChat({ messages, onSendMessage, enabled, bottomRef }: EngineerChatProps) {
    const [input, setInput] = useState("");
    const internalBottomRef = useRef<HTMLDivElement>(null);
    // Use external ref if provided, otherwise internal
    const refToUse = bottomRef || internalBottomRef;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !enabled) return;
        onSendMessage(input);
        setInput("");
    };

    // Auto-Scroll
    useEffect(() => {
        if (refToUse.current) {
            refToUse.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, refToUse]);

    return (
        <div className="w-full flex flex-col bg-[#080808] shrink-0 border-l border-[#27272a] min-w-0 h-full">


            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                        <div className={cn("shrink-0 h-6 w-6 rounded flex items-center justify-center mt-1",
                            msg.role === 'user' ? "bg-zinc-800 text-zinc-400" : "bg-emerald-900/30 text-emerald-400"
                        )}>
                            {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        </div>
                        <div className={cn("p-3 rounded text-sm leading-relaxed",
                            msg.role === 'user' ? "bg-zinc-800 text-zinc-200" : "bg-transparent text-zinc-300 pl-0 pt-0"
                        )}>
                            {msg.role === 'user' ? (
                                msg.text
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={refToUse} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-[#27272a] bg-zinc-950 shrink-0">
                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for code snippets or help..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-emerald-500/50 text-zinc-200"
                        disabled={!enabled}
                    />
                    <button type="submit" disabled={!input.trim() || !enabled} className="absolute right-1 top-1 p-1.5 text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
