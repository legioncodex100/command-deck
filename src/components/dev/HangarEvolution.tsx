"use client";

import { useState, useEffect } from "react";
import { GitBranch, Plus, Save, Play, CheckCircle, Target, ArrowRight, Loader2, FileCode, ListTodo, Bot, Send, PlusCircle, Trash2 } from "lucide-react";
import { Evolution } from "@/types/database";
import { listEvolutions, createEvolution, updateEvolutionSpec, pushTasksToFlightDeck, updateEvolutionDraftTasks } from "@/app/actions/evolution";
import { getEvolutionChat, sendEvolutionMessage, clearEvolutionChat, ChatMessage } from "@/app/actions/evolution-chat";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function HangarEvolution() {
    const [evolutions, setEvolutions] = useState<Evolution[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Create Mode
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    // Editor State
    const [specContent, setSpecContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Task Extractor State
    const [tasks, setTasks] = useState<{ title: string, priority: 'P0' | 'P1' | 'P2' }[]>([]);
    const [newTask, setNewTask] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<'P0' | 'P1' | 'P2'>('P1');
    const [isPushing, setIsPushing] = useState(false);

    // Right Panel Tabs (Changed from 'advisor'|'tasks' to 'spec'|'tasks')
    const [rightTab, setRightTab] = useState<'spec' | 'tasks'>('spec');

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const loadEvolutions = async () => {
        setLoading(true);
        const { data } = await listEvolutions();
        if (data) setEvolutions(data);
        setLoading(false);
    };

    useEffect(() => {
        loadEvolutions();
    }, []);

    // Load active evolution into editor & chat
    useEffect(() => {
        if (selectedId) {
            const evo = evolutions.find(e => e.id === selectedId);
            if (evo) {
                setSpecContent(evo.spec_content || "");
                // Load Draft Tasks
                setTasks(evo.tasks_draft || []);

                // Load Chat History
                getEvolutionChat(selectedId).then(res => {
                    if (res.data) setChatMessages(res.data);
                });
            }
        }
    }, [selectedId, evolutions]);

    // Save Drafts when tasks change
    useEffect(() => {
        if (selectedId && tasks.length >= 0) {
            // We need to avoid saving on initial load if we want to be perfect, 
            // but `tasks` is initialized to [] then set.
            // A distinct save handler is safer to avoid loops or overwrite on load.
            // But for now let's just use effect with simple guard?
            // Probably better to call save explicitly in Add/Delete handlers.
        }
    }, [tasks, selectedId]);

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        const { data } = await createEvolution(newTitle);
        if (data) {
            await loadEvolutions();
            setSelectedId(data.id);
            setNewTitle("");
            setIsCreating(false);
        }
    };

    const handleSaveSpec = async () => {
        if (!selectedId) return;
        setIsSaving(true);
        await updateEvolutionSpec(selectedId, specContent);
        // Optimistic update
        setEvolutions(prev => prev.map(e => e.id === selectedId ? { ...e, spec_content: specContent } : e));
        setIsSaving(false);
    };

    const handleAddTask = async () => {
        if (!newTask.trim()) return;
        const updatedTasks = [...tasks, { title: newTask, priority: newTaskPriority }];
        setTasks(updatedTasks);
        setNewTask("");

        if (selectedId) await updateEvolutionDraftTasks(selectedId, updatedTasks);
    };

    const handlePushToFlightDeck = async () => {
        if (!selectedId || tasks.length === 0) return;
        if (!confirm(`Push ${tasks.length} tasks to Flight Deck? This will mark the Evolution as PUSHED.`)) return;

        setIsPushing(true);
        const res = await pushTasksToFlightDeck(selectedId, tasks);
        if (res.error) {
            alert("Error: " + res.error);
        } else {
            alert("Tasks deployed to Flight Deck.");
            setTasks([]);
            loadEvolutions(); // To reflect status change
        }
        setIsPushing(false);
    };

    const handleSendMessage = async () => {
        if (!selectedId || !chatInput.trim()) return;

        setIsSending(true);
        // Optimistic UI
        const tempMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            role: 'user',
            content: chatInput,
            created_at: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, tempMsg]);
        setChatInput("");

        const res = await sendEvolutionMessage(selectedId, tempMsg.content, specContent);

        if (res.data) {
            // Replace with real data if needed, or just append response
            setChatMessages(prev => [...prev.filter(m => m.id !== tempMsg.id), tempMsg, res.data!]);
        } else {
            alert("Failed to send message");
        }
        setIsSending(false);
    };

    const handleClearChat = async () => {
        if (!selectedId) return;
        if (!confirm("Are you sure you want to clear the chat history? This cannot be undone.")) return;

        setChatMessages([]);
        await clearEvolutionChat(selectedId);
    };

    // Helper to add task from Decision Card
    // Helper to add task from Decision Card
    const addTaskFromCard = async (title: string, priority: 'P0' | 'P1' | 'P2') => {
        const updatedTasks = [...tasks, { title, priority }];
        setTasks(updatedTasks);
        setRightTab('tasks'); // Auto switch to tasks tab

        if (selectedId) await updateEvolutionDraftTasks(selectedId, updatedTasks);
    };

    // Helper to render message content with Decision Cards
    const renderMessageContent = (content: string) => {
        const taskRegex = /\[\[TASK:\s*(.*?)\s*\|\s*(P[0-2])\s*\]\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = taskRegex.exec(content)) !== null) {
            // Text before the card
            if (match.index > lastIndex) {
                parts.push(
                    <div key={lastIndex} className="prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown>{content.substring(lastIndex, match.index)}</ReactMarkdown>
                    </div>
                );
            }

            // The Decision Card
            const title = match[1];
            const priority = match[2] as 'P0' | 'P1' | 'P2';
            parts.push(
                <div key={match.index} className="my-2 p-3 bg-zinc-900 border border-zinc-800 rounded flex items-center gap-3 shadow-sm hover:border-emerald-500/50 transition-colors group">
                    <div className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                        priority === 'P0' ? "bg-red-950 text-red-500" :
                            priority === 'P1' ? "bg-amber-950 text-amber-500" : "bg-zinc-800 text-zinc-500"
                    )}>{priority}</div>
                    <div className="flex-1 text-xs font-medium text-zinc-200">{title}</div>
                    <button
                        onClick={() => addTaskFromCard(title, priority)}
                        className="p-1.5 bg-emerald-900/30 text-emerald-500 rounded hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Add to Tasks"
                    >
                        <PlusCircle className="h-4 w-4" />
                    </button>
                </div>
            );

            lastIndex = taskRegex.lastIndex;
        }

        // Remaining text
        if (lastIndex < content.length) {
            parts.push(
                <div key={lastIndex} className="prose prose-invert prose-xs max-w-none mb-0">
                    <ReactMarkdown>{content.substring(lastIndex)}</ReactMarkdown>
                </div>
            );
        }

        return parts.length > 0 ? parts : (
            <div className="prose prose-invert prose-xs max-w-none mb-0">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

    const selectedEvolution = evolutions.find(e => e.id === selectedId);

    return (
        <div className="h-full w-full bg-[#050505] text-zinc-300 font-mono flex flex-col">
            {/* Header */}
            <div className="h-14 border-b border-zinc-900 bg-black/80 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center border border-zinc-800">
                        <GitBranch className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100">STRATEGIC COMMAND</h1>
                        <p className="text-[10px] text-zinc-500 uppercase">Evolution Lab & Roadmap</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Sidebar / Roadmap (W-64) */}
                <div className="w-64 border-r border-zinc-900 flex flex-col bg-black/40">
                    <div className="p-3 border-b border-zinc-900 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Evolutions</span>
                        <button onClick={() => setIsCreating(true)} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-emerald-400">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {isCreating && (
                        <div className="p-2 border-b border-zinc-900 bg-zinc-900/50">
                            <input
                                autoFocus
                                className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                                placeholder="Feature Name..."
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleCreate();
                                    if (e.key === 'Escape') setIsCreating(false);
                                }}
                            />
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {evolutions.map(evo => (
                            <button
                                key={evo.id}
                                onClick={() => setSelectedId(evo.id)}
                                className={cn(
                                    "w-full text-left p-3 border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors flex flex-col gap-1",
                                    selectedId === evo.id ? "bg-zinc-900/80 border-l-2 border-l-emerald-500" : "border-l-2 border-l-transparent"
                                )}
                            >
                                <span className={cn("text-xs font-bold truncate", selectedId === evo.id ? "text-white" : "text-zinc-400")}>
                                    {evo.title}
                                </span>
                                <span className={cn(
                                    "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded w-fit",
                                    evo.status === 'PUSHED' ? "bg-emerald-950/30 text-emerald-500" :
                                        evo.status === 'COMPLETED' ? "bg-zinc-800 text-zinc-500" :
                                            "bg-amber-950/20 text-amber-500"
                                )}>
                                    {evo.status}
                                </span>
                            </button>
                        ))}
                        {evolutions.length === 0 && !loading && (
                            <div className="p-4 text-center text-xs text-zinc-700 italic">No strategies defined.</div>
                        )}
                    </div>
                </div>

                {/* WORKSPACE */}
                {selectedEvolution ? (
                    <div className="flex-1 flex overflow-hidden">

                        {/* CENTER: Chat Interface (Advisor) - Now the main stage */}
                        <div className="flex-1 flex flex-col bg-[#080808]">
                            {/* Chat Header */}
                            <div className="h-10 border-b border-zinc-900 bg-zinc-900/20 flex items-center px-4 gap-2 text-zinc-400">
                                <Bot className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-bold uppercase">Evolution Advisor</span>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-600">Gemini 2.0 Flash Active</span>
                                    <button
                                        onClick={handleClearChat}
                                        className="p-1 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded transition-colors"
                                        title="Clear Chat"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chatMessages.length === 0 && (
                                    <div className="text-center py-20 opacity-50">
                                        <Bot className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                                        <h3 className="text-sm font-bold text-zinc-400">Strategist Online.</h3>
                                        <p className="text-xs text-zinc-600 mt-2 max-w-xs mx-auto">
                                            I am ready to help you plan "<strong>{selectedEvolution.title}</strong>".
                                            Ask me to brainstorm ideas or draft tasks.
                                        </p>
                                    </div>
                                )}
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={cn("flex flex-col gap-1 max-w-[85%]", msg.role === 'user' ? "self-end items-end" : "self-start items-start")}>
                                        <div className={cn(
                                            "p-4 rounded-xl text-sm leading-relaxed max-w-full overflow-hidden shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-zinc-800 text-zinc-100 rounded-br-none"
                                                : "bg-[#111] border border-zinc-800 text-zinc-300 rounded-bl-none"
                                        )}>
                                            {renderMessageContent(msg.content)}
                                        </div>
                                        <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider px-1">{msg.role}</span>
                                    </div>
                                ))}
                                {isSending && (
                                    <div className="flex items-center gap-2 text-zinc-600 text-xs px-4">
                                        <Bot className="h-3 w-3 animate-pulse" /> Computing Strategy...
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-zinc-900 bg-zinc-900/20">
                                <div className="flex gap-3 max-w-3xl mx-auto">
                                    <input
                                        className="flex-1 bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all"
                                        placeholder="Message the Advisor..."
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                        disabled={isSending}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || !chatInput.trim()}
                                        className="px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Spec & tasks (W-96, wider for editor) */}
                        <div className="w-96 flex flex-col bg-zinc-900/5 border-l border-zinc-900">
                            {/* Panel Tabs */}
                            <div className="flex border-b border-zinc-900">
                                <button
                                    onClick={() => setRightTab('spec')}
                                    className={cn(
                                        "flex-1 py-3 text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-colors",
                                        rightTab === 'spec' ? "bg-zinc-900/50 text-emerald-400 border-b-2 border-emerald-500" : "text-zinc-500 hover:bg-zinc-900/30"
                                    )}
                                >
                                    <FileCode className="h-3.5 w-3.5" /> Mission Spec
                                </button>
                                <button
                                    onClick={() => setRightTab('tasks')}
                                    className={cn(
                                        "flex-1 py-3 text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-colors",
                                        rightTab === 'tasks' ? "bg-zinc-900/50 text-emerald-400 border-b-2 border-emerald-500" : "text-zinc-500 hover:bg-zinc-900/30"
                                    )}
                                >
                                    <ListTodo className="h-3.5 w-3.5" /> Tasks
                                </button>
                            </div>

                            {/* Tab Content: SPEC */}
                            {rightTab === 'spec' && (
                                <div className="flex-1 flex flex-col">
                                    <div className="p-3 bg-amber-950/10 border-b border-amber-900/20 text-[10px] text-amber-500 px-4 leading-tight">
                                        <strong>Context Source:</strong> The Advisor reads this document to understand your mission. Keep it updated.
                                    </div>
                                    <textarea
                                        value={specContent}
                                        onChange={e => setSpecContent(e.target.value)}
                                        className="flex-1 bg-[#0a0a0a] text-zinc-300 p-6 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                                        placeholder="# Feature Strategy&#10;&#10;Describe requirements here..."
                                    />
                                    <div className="p-3 border-t border-zinc-900 flex justify-end">
                                        <button
                                            onClick={handleSaveSpec}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded font-medium disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tab Content: TASKS */}
                            {rightTab === 'tasks' && (
                                <div className="flex-1 flex flex-col">
                                    <div className="p-4 border-b border-zinc-900 space-y-3">
                                        <div className="space-y-2">
                                            <input
                                                className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                                                placeholder="Add actionable task..."
                                                value={newTask}
                                                onChange={e => setNewTask(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                            />
                                            <div className="flex gap-2">
                                                {(['P0', 'P1', 'P2'] as const).map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setNewTaskPriority(p)}
                                                        className={cn(
                                                            "flex-1 py-1 text-[10px] font-bold border rounded transition-colors",
                                                            newTaskPriority === p
                                                                ? (p === 'P0' ? 'bg-red-950/50 border-red-900 text-red-500' : p === 'P1' ? 'bg-amber-950/50 border-amber-900 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400')
                                                                : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={handleAddTask}
                                                className="w-full py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase rounded border border-zinc-700"
                                            >
                                                Add to Queue
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                        {tasks.map((t, idx) => (
                                            <div key={idx} className="flex items-start gap-2 p-2 bg-zinc-900/40 rounded border border-zinc-800/50">
                                                <span className={cn(
                                                    "text-[9px] font-bold px-1 rounded mt-0.5",
                                                    t.priority === 'P0' ? "bg-red-950 text-red-500" :
                                                        t.priority === 'P1' ? "bg-amber-950 text-amber-500" : "bg-zinc-800 text-zinc-500"
                                                )}>{t.priority}</span>
                                                <span className="text-xs text-zinc-400 break-words flex-1">{t.title}</span>
                                            </div>
                                        ))}
                                        {tasks.length === 0 && (
                                            <div className="text-center py-8 text-zinc-700 text-xs italic">
                                                Extract tasks from your spec to push them to the Flight Deck.
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 border-t border-zinc-900 bg-zinc-900/20">
                                        <button
                                            onClick={handlePushToFlightDeck}
                                            disabled={isPushing || tasks.length === 0}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            {isPushing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                            Push to Flight Deck
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
                        <Target className="h-16 w-16 opacity-20 mb-4" />
                        <p className="text-sm uppercase tracking-widest">Select an Evolution Strategy</p>
                    </div>
                )}
            </div>
        </div>
    );
}
