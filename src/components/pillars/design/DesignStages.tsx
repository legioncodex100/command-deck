
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesignStagesProps {
    currentStep: number;
}

const STAGES = [
    { id: 1, label: "Inheritance Intelligence", desc: "Index PRD & Strategy" },
    { id: 2, label: "Domain Synthesis", desc: "Define Atmosphere" },
    { id: 3, label: "Schema-UX Mapping", desc: "Topology Analysis" },
    { id: 4, label: "Stitch Prompt", desc: "High-Bandwidth Gen" },
    { id: 5, label: "Reconciliation", desc: "Code Ingestion" },
    { id: 6, label: "DNA Lock", desc: "Commit Tokens" }
];

export function DesignStages({ currentStep }: DesignStagesProps) {
    return (
        <div className="h-full flex flex-col border-r border-[#27272a] bg-black/50 overflow-hidden">
            <div className="p-4 pb-2 shrink-0">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Master Track</h3>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 relative custom-scrollbar">
                {/* Connector Line */}
                <div className="absolute left-6.5 top-0 bottom-0 w-px bg-[#27272a] -z-10" />

                {STAGES.map((stage) => {
                    const isActive = currentStep === stage.id;
                    const isCompleted = currentStep > stage.id;

                    return (
                        <div key={stage.id} className="flex gap-3 group bg-black/40 backdrop-blur-sm rounded-lg p-1 -ml-1">
                            <div className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors bg-black mt-0.5",
                                isActive ? "border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" :
                                    isCompleted ? "border-emerald-500/50" : "border-zinc-800"
                            )}>
                                {isCompleted ? (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                ) : isActive ? (
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                ) : (
                                    <Circle className="h-2 w-2 text-zinc-800" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-xs font-bold transition-colors",
                                    isActive ? "text-indigo-400" : isCompleted ? "text-emerald-500/70" : "text-zinc-600"
                                )}>
                                    {stage.label}
                                </span>
                                <span className="text-[10px] text-zinc-600 font-mono">{stage.desc}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 mt-auto shrink-0">
                <div className="p-3 rounded border border-[#27272a] bg-zinc-950/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Lock className="h-3 w-3 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Phase Rules</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                        Visual Drift is strictly prohibited. All tokens must be extracted from the Reconciliation Portal.
                    </p>
                </div>
            </div>
        </div>
    );
}
