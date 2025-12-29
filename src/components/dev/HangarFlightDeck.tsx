"use client";

import { useSprint } from "@/hooks/useSprint";
import { CheckCircle, PlayCircle, Plus, Layout, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const CORE_PROJECT_ID = 'c0de0000-0000-0000-0000-000000000000';

export function HangarFlightDeck() {
    const {
        todoTasks,
        activeTask,
        doneTasks,
        startTask,
        completeTask,
        createTask
    } = useSprint(CORE_PROJECT_ID);

    const [isCreating, setIsCreating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const handleCreate = async () => {
        if (!newTaskTitle.trim()) return;
        await createTask({
            title: newTaskTitle,
            priority: 'P1'
        });
        setNewTaskTitle("");
        setIsCreating(false);
    };

    return (
        <div className="h-full w-full bg-[#050505] text-zinc-300 font-mono flex flex-col">
            {/* Header */}
            <div className="h-14 border-b border-zinc-900 bg-black/80 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center border border-zinc-800">
                        <Layout className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100">FLIGHT DECK</h1>
                        <p className="text-[10px] text-zinc-500 uppercase">Mission Control Board</p>
                    </div>
                </div>
            </div>

            {/* Content - 3 Column Layout */}
            <div className="flex-1 overflow-hidden grid grid-cols-12 p-6 gap-6">

                {/* 1. Backlog / Queue */}
                <div className="col-span-4 bg-zinc-900/20 border border-zinc-800/50 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                        <span>Flight Plan (Backlog)</span>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {isCreating && (
                        <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/50">
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

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
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

                {/* 2. Active Protocol */}
                <div className="col-span-4 bg-zinc-900/20 border border-zinc-800/50 rounded-lg flex flex-col overflow-hidden relative">
                    <div className="p-3 border-b border-zinc-800/50 bg-emerald-950/10 font-bold text-xs text-emerald-400 uppercase tracking-widest flex items-center justify-between">
                        <span>In Flight (Active)</span>
                        {activeTask && <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-500"></span>}
                    </div>

                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                        {activeTask ? (
                            <div className="w-full h-full flex flex-col">
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 animate-pulse">
                                        <PlayCircle className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{activeTask.title}</h3>
                                    <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-500 mb-8">
                                        ID: {activeTask.id}
                                    </span>
                                </div>

                                <button
                                    onClick={() => completeTask(activeTask.id)}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-md shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-5 w-5" /> Confirm Completion
                                </button>
                            </div>
                        ) : (
                            <div className="text-zinc-700 flex flex-col items-center gap-2">
                                <AlertCircle className="h-8 w-8 opacity-20" />
                                <span className="text-xs uppercase tracking-widest">Systems Idle</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Mission Log (Done) */}
                <div className="col-span-4 bg-zinc-900/20 border border-zinc-800/50 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest">
                        Mission Log
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
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

            </div>
        </div>
    );
}
