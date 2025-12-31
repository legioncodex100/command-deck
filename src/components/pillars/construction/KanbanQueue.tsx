import { Task } from "@/types/planning";
import { CheckCircle, PlayCircle, CheckCheck } from "lucide-react";
import { PillarPanel, PillarHeader, PillarBody, PillarCard } from "../ui";
import { cn } from "@/lib/utils";

interface KanbanQueueProps {
    todoTasks: Task[];
    doneTasks: Task[];
    activeTask: Task | undefined;
    onStartTask: (id: string) => void;
    onCompleteSprint: () => void;
    onCompletePhase: () => void;
    isPhaseComplete?: boolean;
    className?: string;
    onClose?: () => void;
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
        <PillarPanel className={className}>
            <PillarHeader
                title="Sprint Queue"
                onClose={onClose}
                actions={
                    <span className="bg-zinc-900 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-500 border border-zinc-800">{todoTasks.length}</span>
                }
            />

            <PillarBody>
                <div className="p-3 space-y-2">
                    {todoTasks.map(task => (
                        <div key={task.id} className="p-3 border border-zinc-800/50 rounded bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40 group transition-all relative">
                            <div className="absolute top-3 right-3 text-[10px] font-mono text-zinc-700">{task.id}</div>
                            <div className="flex flex-col gap-2">
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider w-fit px-1.5 py-0.5 rounded border",
                                    task.priority === 'P0' ? 'bg-red-950/20 text-red-400 border-red-900/30' :
                                        task.priority === 'P1' ? 'bg-orange-950/20 text-orange-400 border-orange-900/30' :
                                            'bg-zinc-900 text-zinc-500 border-zinc-800'
                                )}>{task.priority}</span>

                                <p className="text-xs text-zinc-300 font-medium leading-snug pr-6">{task.title}</p>
                            </div>

                            <button
                                onClick={() => onStartTask(task.id)}
                                disabled={!!activeTask}
                                className="mt-3 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                            >
                                <PlayCircle className="h-3 w-3" /> Start Protocol
                            </button>
                        </div>
                    ))}
                    {todoTasks.length === 0 && (
                        <div className="text-center py-10 text-zinc-700 text-xs italic">Queue Empty</div>
                    )}
                </div>

                {/* COMPLETED SECTION - Integrated into Body or Footer? Let's assume Body for now */}
                {/* Actually, let's keep it as part of the scrolling body but separated visually */}
                <div className="mt-4 border-t border-zinc-800/50 pt-4 px-3 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Completed</span>
                        <span className="bg-zinc-900 px-1.5 rounded text-[10px] text-zinc-600">{doneTasks.length}</span>
                    </div>
                    <div className="space-y-1">
                        {doneTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 p-2 rounded hover:bg-zinc-900/30 text-zinc-500 group">
                                <CheckCircle className="h-3 w-3 text-emerald-500/40 group-hover:text-emerald-500" />
                                <span className="text-[10px] line-through decoration-emerald-900/50 group-hover:text-zinc-400">{task.title}</span>
                            </div>
                        ))}
                    </div>


                    {todoTasks.length === 0 && !activeTask && doneTasks.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={onCompleteSprint}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                            >
                                <CheckCircle className="h-4 w-4" /> Finish Sprint
                            </button>
                        </div>
                    )}

                    {/* Phase Completion */}
                    <div className="mt-4 text-center">
                        {isPhaseComplete ? (
                            <div className="w-full py-1.5 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2">
                                <CheckCheck className="h-4 w-4" /> Pillar F Closed
                            </div>
                        ) : (
                            <button
                                onClick={onCompletePhase}
                                className="text-zinc-600 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest underline decoration-dotted underline-offset-4 transition-colors"
                            >
                                Close Pillar F
                            </button>
                        )}
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
