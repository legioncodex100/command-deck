"use client";

import React, { useState } from 'react';
import { Terminal, Code2, Trash2 } from "lucide-react";
import { UnifiedChatInterface, Message } from '../ui/UnifiedChatInterface';
import { Task } from "@/types/planning";

interface EngineerChatProps {
    messages: { role: 'user' | 'model'; text: string; }[];
    onSendMessage: (text: string) => void;
    enabled: boolean;
    bottomRef?: React.RefObject<HTMLDivElement>;
    className?: string;
    activeTask?: Task;
    onClearChat?: () => void;
}

export function EngineerChat({
    messages,
    onSendMessage,
    enabled,
    bottomRef,
    className,
    activeTask,
    onClearChat
}: EngineerChatProps) {
    const [input, setInput] = useState("");

    const handleSend = (text: string) => {
        onSendMessage(text);
        setInput("");
    };

    const emptyState = (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
            <div className="h-16 w-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 opacity-50">
                <Code2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-100 mb-2">Build Station</h3>
            <p className="text-sm text-zinc-500 max-w-xs mb-8">
                Select a task from the Kanban board to establish an uplink with the Engineering Drone.
            </p>
        </div>
    );

    const headerActions = activeTask ? (
        <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/30 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeTask.title.substring(0, 20)}{activeTask.title.length > 20 && '...'}
            </span>
            {onClearChat && (
                <button onClick={onClearChat} className="p-1 hover:bg-red-950/30 rounded text-zinc-600 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    ) : (
        <span className="text-[10px] text-zinc-600 italic px-2">Offline - Select Task</span>
    );

    return (
        <UnifiedChatInterface
            title="Engineer Uplink"
            icon={Terminal}
            messages={messages as Message[]}
            isProcessing={false}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onClear={activeTask ? onClearChat : undefined}
            disabled={!enabled}
            className={className}
            emptyState={emptyState}
            headerActions={headerActions}
            placeholder={enabled ? "Transmit code block or query..." : "Select a task to enable uplink..."}
        />
    );
}
