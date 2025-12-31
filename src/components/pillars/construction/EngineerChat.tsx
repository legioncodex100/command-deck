```typescript
import { Bot, Send, Terminal, User, Trash2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState } from "react";
import { Task } from "@/types/planning";
import { PillarPanel, PillarHeader, PillarBody } from "../ui";
import { usePillarTheme } from "../PillarProvider";

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface EngineerChatProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    enabled: boolean;
    bottomRef?: React.RefObject<HTMLDivElement>;
    className?: string; // StandardPillarLayout prop
    activeTask?: Task;
    onClearChat?: () => void;
}

export function EngineerChat({ messages, onSendMessage, enabled, bottomRef, className, activeTask, onClearChat }: EngineerChatProps) {
    const [input, setInput] = useState("");
    const internalBottomRef = useRef<HTMLDivElement>(null);
    // Use external ref if provided, otherwise internal
    const refToUse = bottomRef || internalBottomRef;
    const theme = usePillarTheme();

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
        <PillarPanel className={className}>
             <PillarHeader 
                icon={Terminal}
                title="Engineer Uplink" 
                subtitle={activeTask ? activeTask.id : "NO SIGNAL"}
                actions={
                    activeTask ? (
                         <div className="flex items-center gap-2">
                             <span className={`px - 2 py - 0.5 rounded - full ${ theme.bg } ${ theme.text } text - [10px] font - mono border ${ theme.border } flex items - center gap - 2`}>
                                <span className={`w - 1.5 h - 1.5 rounded - full ${ theme.text.replace('text-', 'bg-').replace('400', '500') } animate - pulse`} />
                                {activeTask.title.substring(0, 20)}{activeTask.title.length > 20 && '...'}
                            </span>
                             {onClearChat && (
                                <button onClick={onClearChat} className="p-1 hover:bg-zinc-800 rounded text-zinc-600 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                         </div>
                    ) : (
                        <span className="text-[10px] text-zinc-600 italic">Offline</span>
                    )
                }
            />

            <PillarBody>
                <div className="p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                             <div className={cn("shrink-0 h-6 w-6 rounded flex items-center justify-center mt-1",
                                msg.role === 'user' ? "bg-zinc-800 text-zinc-400" : `${ theme.iconBg } ${ theme.text } `
                            )}>
                                {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                            </div>
                            <div className={cn("p-3 rounded-lg text-sm leading-relaxed",
                                msg.role === 'user' ? "bg-zinc-800/80 text-zinc-200 border border-zinc-700" : `${ theme.bg } ${ theme.border } border text - zinc - 300`
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
            </PillarBody>

            <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-950/50 shrink-0">
                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={enabled ? "Transmit code block or query..." : "Select a task to enable uplink..."}
                        className={`w - full bg - black / 40 border border - zinc - 800 rounded py - 2 pl - 3 pr - 10 text - sm focus: outline - none focus:${ theme.border } text - zinc - 200 placeholder: text - zinc - 700 transition - all`}
                        disabled={!enabled}
                    />
                    <button type="submit" disabled={!input.trim() || !enabled} className={`absolute right - 1 top - 1 p - 1.5 ${ theme.text } hover: opacity - 80 disabled: opacity - 30`}>
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </PillarPanel>
    );
}
```
