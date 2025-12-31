import { Task } from "@/types/planning";
import { CheckCircle, PlayCircle, CheckCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanQueueProps {
    todoTasks: Task[];
    doneTasks: Task[];
    activeTask: Task | undefined;
    onStartTask: (id: string) => void;
    onCompleteSprint: () => void;
    onCompletePhase: () => void;
    isPhaseComplete?: boolean;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function KanbanQueue({
    todoTasks,
    doneTasks,
    activeTask,
    onStartTask,
    onCompleteSprint,
    onCompletePhase,
    isPhaseComplete = false,
    className,
    onClose
}: KanbanQueueProps) {
    return (
        <div className={cn("col-span-3 border-r border-[#27272a] flex flex-col bg-[#050505] overflow-hidden h-full", className)}>
            <div className="p-3 border-b border-[#27272a] bg-zinc-950 font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                <span>Sprint Queue</span>
                <div className="flex items-center gap-2">
                    <span className="bg-zinc-900 px-1.5 rounded">{todoTasks.length}</span>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-1 text-zinc-500 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {todoTasks.map(task => (
                    <div key={task.id} className="p-3 border border-zinc-800 rounded bg-zinc-900/40 hover:border-zinc-700 group transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn("text-xs font-bold",
                                task.priority === 'P0' ? 'text-red-400' :
                                    task.priority === 'P1' ? 'text-orange-400' : 'text-zinc-400'
                            )}>{task.priority}</span>
                            <span className="text-[10px] font-mono text-zinc-600">{task.id}</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium leading-snug mb-3">{task.title}</p>

                        <button
                            onClick={() => onStartTask(task.id)}
                            disabled={!!activeTask}
                            className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <PlayCircle className="h-3 w-3" /> Start
                        </button>
                    </div>
                ))}
                {todoTasks.length === 0 && (
                    <div className="text-center py-10 text-zinc-700 text-xs italic">Queue Empty</div>
                )}
            </div>

            {/* COMPLETED SECTION */}
            <div className="h-1/3 border-t border-[#27272a] flex flex-col bg-zinc-950/30">
                <div className="p-2 border-b border-[#27272a] font-bold text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                    <span>Completed</span>
                    <span className="bg-zinc-900 px-1.5 rounded">{doneTasks.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {doneTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2 rounded hover:bg-zinc-900/50 text-emerald-600/50">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-[10px] line-through decoration-emerald-900">{task.title}</span>
                        </div>
                    ))}
                </div>
                {/* Complete Sprint Button */}
                {todoTasks.length === 0 && !activeTask && doneTasks.length > 0 && (
                    <div className="p-3 border-t border-[#27272a]">
                        <button
                            onClick={onCompleteSprint}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" /> Finish Sprint
                        </button>
                    </div>
                )}

                {/* Phase Completion */}
                <div className="p-3 border-t border-[#27272a] mt-auto">
                    {isPhaseComplete ? (
                        <div className="w-full py-1.5 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2">
                            <CheckCheck className="h-4 w-4" /> Pillar F Closed
                        </div>
                    ) : (
                        <button
                            onClick={onCompletePhase}
                            className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2"
                            title="Generate Relay F -> G"
                        >
                            Close Pillar F
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
