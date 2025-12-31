"use client";

import React, { useState } from 'react';
import { Layers, FileText, CheckCheck, AlertCircle, ArrowRight, Rocket, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BacklogMapper } from './BacklogMapper';
import { BacklogPreview } from './BacklogPreview';
import { Task } from '@/types/planning';
import { PillarPanel, PillarHeader, PillarBody } from '../ui';
import { usePillarTheme } from '../PillarProvider';

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
    const theme = usePillarTheme();

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={Wrench}
                title="Planning Workbench"
                onClose={onClose}
                actions={
                    <div className="flex items-center gap-1">
                        {relayGenerated ? (
                            <CheckCheck className={`h-4 w-4 ${theme.text}`} />
                        ) : (
                            <button
                                onClick={onCompletePhase}
                                disabled={isProcessing}
                                className={`p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:${theme.text} transition-colors`}
                                title={staleState.isStale && typeof staleState.reason === 'string' ? `Stale: ${staleState.reason}` : "Complete Phase"}
                            >
                                {staleState.isStale ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <ArrowRight className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                }
            />

            {/* View Toggles - Sub Header */}
            <div className="flex border-b border-zinc-900 bg-zinc-950 items-center justify-between shrink-0">
                <div className="flex flex-1">
                    <button
                        onClick={() => setView('TASKS')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-zinc-900",
                            view === 'TASKS' ? `bg-zinc-900 ${theme.text}` : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <Layers className="h-3.5 w-3.5" /> Task Map
                    </button>
                    <button
                        onClick={() => setView('DOC')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-[#27272a]",
                            view === 'DOC' ? `bg-zinc-900 ${theme.text}` : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <FileText className="h-3.5 w-3.5" /> Backlog
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                {view === 'DOC' ? (
                    <BacklogPreview
                        markdown={backlogMarkdown}
                        onSave={onSaveBacklog}
                        isSaving={isProcessing}
                    />
                ) : (
                    /* Task Mapper Logic Wrapper */
                    <div className="flex flex-col h-full">
                        <div className="p-3 border-b border-zinc-900 flex justify-between items-center bg-black/60 shadow-sm shrink-0">
                            {selectedTasks.length > 0 ? (
                                <button
                                    onClick={handleCreateSprint}
                                    className={`w-full flex items-center justify-center gap-2 px-3 py-1 ${theme.text.replace('text-', 'bg-').replace('400', '600')} hover:${theme.text.replace('text-', 'bg-').replace('400', '500')} text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all animate-in fade-in zoom-in duration-300`}
                                >
                                    <Rocket className="h-3 w-3" /> Launch ({selectedTasks.length})
                                </button>
                            ) : (
                                <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold w-full text-center">
                                    Select Tasks to Sprint
                                </div>
                            )}
                        </div>

                        {staleState.isStale && (
                            <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 shrink-0">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide truncate">
                                    {typeof staleState.reason === 'string' ? `Ripple: ${staleState.reason}` : "Ripple Detected"}
                                </span>
                            </div>
                        )}

                        <PillarBody scrollable={false} className="p-0">
                            <BacklogMapper
                                tasks={backlogTasks}
                                isGenerating={isProcessing}
                                onGenerate={onGenerate}
                                selectedIds={selectedTasks}
                                onToggleSelect={onToggleSelect}
                            />
                        </PillarBody>
                    </div>
                )}
            </div>
        </PillarPanel>
    );
}
