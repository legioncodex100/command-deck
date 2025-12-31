
import { AlertCircle, Layers, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/planning";

interface BacklogMapperProps {
    tasks: Task[];
    isGenerating: boolean;
    onGenerate: () => void;
    // Selection Props
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
}

export function BacklogMapper({ tasks = [], isGenerating, onGenerate, selectedIds = [], onToggleSelect }: BacklogMapperProps) {
    return (
        <div className="h-full flex flex-col bg-[#050505] relative overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-3 border-b border-[#27272a] bg-zinc-950">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-400">
                    <Layers className="h-4 w-4" /> Backlog Mapper
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                    {isGenerating ? "Decomposing..." : "Decompose Strategy"}
                </button>
            </div>

            {/* Task List */}
            {/* Task List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4 p-4">
                        <Layers className="h-10 w-10 opacity-20" />
                        <p className="text-xs text-center max-w-[200px]">
                            No tasks mapped. <br /> Click 'Decompose Strategy' to break down the PRD.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {/* Group tasks by phase */}
                        {Array.from(new Set(tasks.map(t => t.phase))).sort().map(phase => {
                            const phaseTasks = tasks.filter(t => t.phase === phase);
                            return (
                                <div key={phase}>
                                    {/* Phase Header */}
                                    <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-y border-[#27272a] px-3 py-1.5 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{phase}</span>
                                        </div>
                                        <span className="text-[9px] text-zinc-600 font-mono">{phaseTasks.length} ITEMS</span>
                                    </div>

                                    {/* Tasks Grid */}
                                    <div className="p-3 space-y-2">
                                        {phaseTasks.map((task, i) => {
                                            const isSelected = selectedIds.includes(task.id);
                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => onToggleSelect && onToggleSelect(task.id)}
                                                    className={cn(
                                                        "border rounded-md transition-all group p-3 relative overflow-hidden cursor-pointer",
                                                        isSelected
                                                            ? "bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                                            : "bg-zinc-900/40 border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-900/60"
                                                    )}
                                                >
                                                    {/* Selection Indicator */}
                                                    <div className="absolute right-2 top-2 z-10">
                                                        <div className={cn(
                                                            "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                                                            isSelected ? "bg-indigo-500 border-indigo-500" : "border-zinc-700 group-hover:border-zinc-500"
                                                        )}>
                                                            {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>

                                                    {/* Priority Stripe */}
                                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-colors",
                                                        task.priority === 'P0' ? 'bg-red-500' :
                                                            task.priority === 'P1' ? 'bg-orange-500' :
                                                                task.priority === 'P2' ? 'bg-emerald-500' : 'bg-zinc-700'
                                                    )} />

                                                    <div className="pl-3 pr-6">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={cn("text-xs font-bold leading-tight transition-colors line-clamp-2",
                                                                isSelected ? "text-indigo-200" : "text-zinc-300 group-hover:text-zinc-200"
                                                            )}>
                                                                {task.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                                task.priority === 'P0' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                                    task.priority === 'P1' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                                                        'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                                            )}>
                                                                {task.priority}
                                                            </span>
                                                            <span className="text-[9px] font-mono text-zinc-600">{task.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
