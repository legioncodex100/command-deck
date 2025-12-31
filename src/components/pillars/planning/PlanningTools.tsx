"use client";

import React, { useState } from 'react';
import { Layers, FileText, CheckCheck, AlertCircle, ArrowRight, Rocket, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BacklogMapper } from './BacklogMapper';
import { BacklogPreview } from './BacklogPreview';
import { Task } from '@/types/planning';

interface PlanningToolsProps {
    // Data Props
    backlogTasks: Task[];
    backlogMarkdown: string;
    selectedTasks: string[];
    relayGenerated: boolean;
    staleState: { isStale: boolean; reason?: string | null };
    isProcessing: boolean;

    // Handlers
    onGenerate: () => void;
    onToggleSelect: (id: string) => void;
    handleCreateSprint: () => void;
    onSaveBacklog: () => Promise<void>;
    onCompletePhase: () => void;

    // StandardPillarLayout Props
    className?: string;
    onClose?: () => void;
}

export function PlanningTools({
    backlogTasks,
    backlogMarkdown,
    selectedTasks,
    relayGenerated,
    staleState,
    isProcessing,
    onGenerate,
    onToggleSelect,
    handleCreateSprint,
    onSaveBacklog,
    onCompletePhase,
    className,
    onClose
}: PlanningToolsProps) {
    const [view, setView] = useState<'TASKS' | 'DOC'>('TASKS');

    return (
        <div className={cn("min-w-0 flex flex-col bg-[#050505] h-full overflow-hidden", className)}>
            {/* View Toggles & Header */}
            <div className="flex border-b border-[#27272a] bg-zinc-950 items-center justify-between">
                <div className="flex flex-1">
                    <button
                        onClick={() => setView('TASKS')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-[#27272a]",
                            view === 'TASKS' ? "bg-zinc-900 text-purple-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <Layers className="h-3.5 w-3.5" /> Task Map
                    </button>
                    <button
                        onClick={() => setView('DOC')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-[#27272a]",
                            view === 'DOC' ? "bg-zinc-900 text-emerald-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <FileText className="h-3.5 w-3.5" /> Backlog
                    </button>
                </div>

                <div className="px-2 flex items-center gap-1">
                    {relayGenerated ? (
                        <CheckCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                        <button
                            onClick={onCompletePhase}
                            disabled={isProcessing}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-emerald-500 transition-colors"
                            title={staleState.isStale && typeof staleState.reason === 'string' ? `Stale: ${staleState.reason}` : "Complete Phase"}
                        >
                            {staleState.isStale ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <ArrowRight className="h-4 w-4" />}
                        </button>
                    )}

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-1 ml-1 text-zinc-500 hover:text-white border-l border-zinc-800 pl-2">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {view === 'DOC' ? (
                    <BacklogPreview
                        markdown={backlogMarkdown}
                        onSave={onSaveBacklog}
                        isSaving={isProcessing}
                    />
                ) : (
                    /* Task Mapper Logic Wrapper */
                    <div className="flex flex-col h-full">
                        <header className="p-3 border-b border-zinc-900 flex justify-between items-center bg-black/60 shadow-sm">
                            {selectedTasks.length > 0 ? (
                                <button
                                    onClick={handleCreateSprint}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all animate-in fade-in zoom-in duration-300"
                                >
                                    <Rocket className="h-3 w-3" /> Launch ({selectedTasks.length})
                                </button>
                            ) : (
                                <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold w-full text-center">
                                    Select Tasks to Sprint
                                </div>
                            )}
                        </header>

                        {staleState.isStale && (
                            <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide truncate">
                                    {typeof staleState.reason === 'string' ? `Ripple: ${staleState.reason}` : "Ripple Detected"}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 overflow-auto p-0 min-h-0">
                            <BacklogMapper
                                tasks={backlogTasks}
                                isGenerating={isProcessing}
                                onGenerate={onGenerate}
                                selectedIds={selectedTasks}
                                onToggleSelect={onToggleSelect}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
