import { cn } from "@/lib/utils";
import { CheckmarkFilled, RadioButton, PlayFilled } from "@carbon/icons-react";
// RadioButton looks like an empty circle/ring.

export interface StageItem {
    id: string;
    label: string;
}

interface StageNavigatorProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>; // Carbon icons are components
    items: StageItem[];
    completedIds: string[];
    currentId?: string; // Optional: If we want to highlight the 'active' working item specifically
    className?: string;
}

export function StageNavigator({ title, icon: Icon, items, completedIds, currentId, className }: StageNavigatorProps) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Header */}
            <div>
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 font-mono mb-4 pl-1">
                    <Icon className="h-4 w-4 text-emerald-500" /> {title}
                </h2>
                <ul className="space-y-3">
                    {items.map(item => {
                        const isDone = completedIds.includes(item.id);
                        const isActive = currentId === item.id;

                        return (
                            <li key={item.id} className={cn(
                                "flex items-center gap-3 text-sm p-3 rounded-md transition-all border font-mono select-none",
                                // Done State
                                isDone && "bg-emerald-950/30 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]",
                                // Active/Working State (if we use it)
                                isActive && !isDone && "bg-zinc-900 text-white border-zinc-700 shadow-sm",
                                // Pending State
                                !isDone && !isActive && "bg-transparent text-zinc-600 border-transparent hover:bg-zinc-900/50 hover:text-zinc-400"
                            )}>
                                {isDone ? (
                                    <CheckmarkFilled className="h-4 w-4 shrink-0 text-emerald-500" />
                                ) : (
                                    isActive ? <PlayFilled className="h-4 w-4 shrink-0 text-zinc-100 animate-pulse" /> : <RadioButton className="h-4 w-4 shrink-0 opacity-50" />
                                )}
                                <span className="tracking-tight">{item.label}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
}
