"use client";

import { useSprint } from "@/hooks/useSprint";
import { CheckCircle, PlayCircle, Plus, Layout, AlertCircle, Sparkles, Copy, X, Bot, Send, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { getTaskChat, sendTaskMessage, clearTaskChat, ChatMessage } from "@/app/actions/flight-deck-chat";
import ReactMarkdown from "react-markdown";
import StandardPillarLayout from '@/components/pillars/StandardPillarLayout';

const CORE_PROJECT_ID = 'c0de0000-0000-0000-0000-000000000000';

export function HangarFlightDeck() {
    const {
        todoTasks,
        activeTask,
        doneTasks,
        startTask,
        stopTask,
        completeTask,
        createTask
    } = useSprint(CORE_PROJECT_ID);

    const [isCreating, setIsCreating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Toast State
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    // Load Chat on Active Task Change
    useEffect(() => {
        if (activeTask) {
            getTaskChat(activeTask.id).then(res => {
                if (res.data) setChatMessages(res.data);
            });
        } else {
            setChatMessages([]);
        }
    }, [activeTask?.id]); // Only re-run if ID changes

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleSendMessage = async (text: string = chatInput) => {
        if (!activeTask || !text.trim()) return;

        setIsSending(true);
        const tempMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            role: 'user',
            content: text,
            created_at: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, tempMsg]);
        if (text === chatInput) setChatInput(""); // Only clear input if manual type

        const res = await sendTaskMessage(activeTask.id, tempMsg.content, {
            title: activeTask.title,
            priority: activeTask.priority,
            description: activeTask.description || undefined
        });

        if (res.data) {
            setChatMessages(prev => [...prev.filter(m => m.id !== tempMsg.id), tempMsg, res.data!]);
        } else {
            alert("Failed to send message: " + res.error);
        }
        setIsSending(false);
    };

    const activeTaskIdRef = useRef<string | null>(null);

    // Auto-Ignition: Detect when a new task becomes active
    useEffect(() => {
        if (activeTask && activeTask.id !== activeTaskIdRef.current) {
            // New task engaged. Check if it has empty chat.
            getTaskChat(activeTask.id).then(res => {
                const messages = res.data || [];
                setChatMessages(messages);

                // If no messages, trigger Auto-Analysis
                if (messages.length === 0) {
                    // We need to trigger this slightly after mount or it might conflict
                    setTimeout(() => {
                        handleSendMessage("Analyzye this task based on the Context Pipeline.");
                    }, 500);
                }
            });
            activeTaskIdRef.current = activeTask.id;
        } else if (!activeTask) {
            setChatMessages([]);
            activeTaskIdRef.current = null;
        }
    }, [activeTask?.id]); // Only re-run if ID changes

    const handleStopTask = async () => {
        if (!activeTask) return;
        if (!confirm("Abort mission? This will move the task back to the backlog.")) return;
        stopTask(activeTask.id);
    };

    const handleClearChat = async () => {
        if (!activeTask) return;
        if (!confirm("Clear chat history for this task?")) return;
        setChatMessages([]);
        await clearTaskChat(activeTask.id);
    };

    const handleCreate = async () => {
        if (!newTaskTitle.trim()) return;
        await createTask({
            title: newTaskTitle,
            priority: 'P1'
        });
        setNewTaskTitle("");
        setIsCreating(false);
    };


    const LeftPanel = (
        <div className="h-full flex flex-col bg-zinc-900/20 text-zinc-300">
            <div className="p-3 border-b border-zinc-900 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center justify-between shrink-0">
                <span>Flight Plan (Backlog)</span>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {isCreating && (
                <div className="p-3 border-b border-zinc-900 bg-zinc-900/50 shrink-0">
                    <input
                        autoFocus
                        className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="New directive..."
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleCreate();
                            if (e.key === 'Escape') setIsCreating(false);
                        }}
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
                {todoTasks.map(task => (
                    <div key={task.id} className="p-3 border border-zinc-800/80 rounded bg-black/40 hover:border-indigo-500/30 group transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                                task.priority === 'P0' ? 'bg-red-950/30 text-red-400 border border-red-900/50' :
                                    task.priority === 'P1' ? 'bg-amber-950/30 text-amber-400 border border-amber-900/50' :
                                        'bg-zinc-900 text-zinc-500 border border-zinc-800'
                            )}>{task.priority}</span>
                            <span className="text-[10px] font-mono text-zinc-600">#{task.id.slice(0, 4)}</span>
                        </div>
                        <p className="text-sm text-zinc-300 font-medium leading-snug mb-3">{task.title}</p>

                        <button
                            onClick={() => startTask(task.id)}
                            disabled={!!activeTask}
                            className="w-full py-1.5 bg-zinc-900 hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-500/30 border border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2 transition-all"
                        >
                            <PlayCircle className="h-3 w-3" /> Engage
                        </button>
                    </div>
                ))}
                {todoTasks.length === 0 && !isCreating && (
                    <div className="text-center py-10 text-zinc-700 text-xs uppercase tracking-widest">No Active Directives</div>
                )}
            </div>
        </div>
    );

    const MainPanel = (
        <div className="h-full flex flex-col bg-[#0a0a0a] relative">
            <div className="p-3 border-b border-zinc-900 bg-emerald-950/10 font-bold text-xs text-emerald-400 uppercase tracking-widest flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    {activeTask && <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-500"></span>}
                    <span>{activeTask ? `Active: ${activeTask.id.slice(0, 6)}` : "FLIGHT DECK V2 ONLINE"}</span>
                </div>
                {activeTask && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleStopTask}
                            className="flex items-center gap-1.5 px-2 py-1 bg-red-900/30 hover:bg-red-950 hover:text-red-400 border border-red-900/50 rounded text-[9px] text-red-500 transition-all font-bold"
                        >
                            <XCircle className="h-3 w-3" /> Abort
                        </button>
                        <button
                            onClick={() => completeTask(activeTask.id)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-emerald-900/30 hover:bg-emerald-500 hover:text-white border border-emerald-900/50 rounded text-[9px] text-emerald-500 transition-all font-bold"
                        >
                            <CheckCircle className="h-3 w-3" /> Complete Mission
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
                {activeTask ? (
                    <>
                        <div className="p-3 bg-zinc-900/30 border-b border-zinc-900 flex justify-between items-start shrink-0">
                            <div className="font-bold text-sm text-zinc-200 leading-tight">
                                {activeTask.title}
                            </div>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0",
                                activeTask.priority === 'P0' ? 'bg-red-950 text-red-500' :
                                    activeTask.priority === 'P1' ? 'bg-amber-950 text-amber-500' :
                                        'bg-zinc-800 text-zinc-500'
                            )}>{activeTask.priority}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                            {toast && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-800 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                                    {toast}
                                </div>
                            )}
                            {chatMessages.length === 0 && (
                                <div className="text-center py-10 opacity-40">
                                    <Bot className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-xs font-bold text-zinc-400">Technical Copilot Online.</h3>
                                    <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px] mx-auto">
                                        I can help you implement this task. Ask for a prompt, code snippet, or debugging help.
                                    </p>
                                </div>
                            )}

                            {chatMessages.map(msg => (
                                <div key={msg.id} className={cn("flex flex-col gap-1 max-w-[90%]", msg.role === 'user' ? "self-end items-end" : "self-start items-start")}>
                                    <div className={cn(
                                        "relative group p-3 rounded-lg text-sm font-mono leading-relaxed max-w-full shadow-sm selection:bg-emerald-500/30",
                                        msg.role === 'user'
                                            ? "bg-zinc-800 text-zinc-200 rounded-br-none"
                                            : "bg-[#111] border border-zinc-800 text-zinc-400 rounded-bl-none"
                                    )}>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(msg.content);
                                                showToast("Message Copied");
                                            }}
                                            className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/50 hover:bg-black rounded text-zinc-500 hover:text-zinc-200 z-10"
                                            title="Copy Markdown"
                                        >
                                            <Copy className="h-2.5 w-2.5" />
                                        </button>

                                        <ReactMarkdown
                                            components={{
                                                pre: ({ node, ...props }) => {
                                                    // @ts-ignore - complex react node typings
                                                    const codeText = props.children?.[0]?.props?.children?.[0] || "";
                                                    return (
                                                        <div className="w-full my-3 bg-zinc-950 rounded border border-zinc-900 overflow-hidden relative group/code">
                                                            <div className="flex justify-between items-center px-2 py-1 bg-zinc-900/50 border-b border-zinc-900">
                                                                <span className="text-[9px] text-zinc-500 font-bold uppercase">Code</span>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(String(codeText));
                                                                        showToast("Code Copied");
                                                                    }}
                                                                    className="flex items-center gap-1 text-[9px] text-zinc-500 hover:text-emerald-400 transition-colors"
                                                                >
                                                                    <Copy className="h-2.5 w-2.5" /> Copy
                                                                </button>
                                                            </div>
                                                            <div className="p-3">
                                                                <pre {...props} className="text-xs whitespace-pre-wrap break-words font-mono text-zinc-300" />
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                                code: ({ node, ...props }) => {
                                                    const isInline = !props.className?.includes('language-');
                                                    return <code {...props} className={cn("bg-zinc-900/50 text-emerald-400 rounded px-1.5 py-0.5 font-mono text-xs", props.className)} />
                                                },
                                                p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0 break-words" />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                    <span className="text-[8px] text-zinc-700 uppercase font-bold tracking-wider px-1">{msg.role}</span>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex items-center gap-2 text-zinc-700 text-[10px] px-2">
                                    <Bot className="h-3 w-3 animate-pulse text-emerald-900" /> Generating code...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 border-t border-zinc-900 bg-zinc-900/20 shrink-0">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-black border border-zinc-800 rounded px-3 py-2 text-xs focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all font-mono text-zinc-300 placeholder:text-zinc-700"
                                    placeholder="Command the Copilot..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isSending}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={isSending || !chatInput.trim()}
                                    className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded disabled:opacity-50 transition-colors"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={handleClearChat}
                                    className="px-2 bg-zinc-900/50 hover:bg-red-950/20 text-zinc-700 hover:text-red-500 rounded border border-transparent hover:border-red-900/30 transition-colors"
                                    title="Clear Chat"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
                        <AlertCircle className="h-8 w-8 opacity-20 mb-2" />
                        <span className="text-xs uppercase tracking-widest">Systems Idle</span>
                        <p className="text-[10px] text-zinc-800 mt-1">Engage a directive to activate Copilot.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const RightPanel = (
        <div className="h-full flex flex-col bg-zinc-900/20">
            <div className="p-3 border-b border-zinc-900 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest shrink-0">
                Mission Log
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
                {doneTasks.map(task => (
                    <div key={task.id} className="p-3 border border-zinc-800/30 rounded bg-zinc-900/20 flex items-center gap-3 opacity-60">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-zinc-400 line-through decoration-zinc-700">{task.title}</span>
                    </div>
                ))}
                {doneTasks.length === 0 && (
                    <div className="text-center py-10 text-zinc-700 text-xs uppercase tracking-widest">No Log Entries</div>
                )}
            </div>
        </div>
    );

    return (
        <StandardPillarLayout
            leftContent={LeftPanel}
            mainContent={MainPanel}
            rightContent={RightPanel}
            themeColor="emerald"
        />
    );
}
