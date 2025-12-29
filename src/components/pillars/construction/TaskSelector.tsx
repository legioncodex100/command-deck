
import { cn } from "@/lib/utils";
import { Check, Square } from "lucide-react";

interface Task {
    id: string;
    title: string;
    priority: "P0" | "P1" | "P2" | "P3";
    phase: string;
}

interface TaskSelectorProps {
    tasks: Task[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}

export function TaskSelector({ tasks, selectedIds, onToggle }: TaskSelectorProps) {
    // Group by Priority for better UX
    const p0 = tasks.filter(t => t.priority === 'P0');
    const p1 = tasks.filter(t => t.priority === 'P1');
    const others = tasks.filter(t => !['P0', 'P1'].includes(t.priority));

    const renderGroup = (groupTasks: Task[], label: string, colorClass: string) => (
        <div className="mb-4">
            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", colorClass)}>{label}</h4>
            <div className="space-y-1">
                {groupTasks.map(task => {
                    const isSelected = selectedIds.includes(task.id);
                    return (
                        <div
                            key={task.id}
                            onClick={() => onToggle(task.id)}
                            className={cn(
                                "flex items-start gap-2 p-2 rounded cursor-pointer transition-all border",
                                isSelected ? "bg-indigo-500/20 border-indigo-500/50" : "bg-black/20 border-transparent hover:bg-white/5"
                            )}
                        >
                            <div className={cn("mt-0.5", isSelected ? "text-indigo-400" : "text-zinc-600")}>
                                {isSelected ? <Check className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={cn("text-xs font-medium truncate", isSelected ? "text-indigo-100" : "text-zinc-400")}>{task.title}</div>
                                <div className="text-[9px] text-zinc-600 font-mono">{task.id} • {task.phase}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 bg-black/50 border-r border-[#27272a] overflow-hidden">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Backlog Consumer</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="text-xs text-zinc-500 italic">No tasks in backlog.</div>
                ) : (
                    <>
                        {p0.length > 0 && renderGroup(p0, 'Critical Path (P0)', 'text-red-500')}
                        {p1.length > 0 && renderGroup(p1, 'Core Features (P1)', 'text-orange-500')}
                        {others.length > 0 && renderGroup(others, 'Backlog', 'text-zinc-500')}
                    </>
                )}
            </div>
        </div>
    );
}
