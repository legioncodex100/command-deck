
import { AlertCircle, Bot, CheckCircle } from "lucide-react";

interface WorkOrderPanelProps {
    workOrder: any;
    isGenerating: boolean;
    onComplete: () => void;
}

export function WorkOrderPanel({ workOrder, isGenerating, onComplete }: WorkOrderPanelProps) {
    return (
        <div className="w-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800 shrink-0 h-full min-w-0 flex flex-col">
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
                    <Bot className="h-8 w-8 animate-bounce" />
                    <p className="text-xs font-mono">Generating Work Order...</p>
                </div>
            ) : workOrder ? (
                <>
                    <div className="space-y-6 flex-1">
                        <div className="p-4 rounded-lg bg-indigo-950/10 border border-indigo-500/20">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" /> Context
                            </h3>
                            <p className="text-sm text-zinc-300 leading-relaxed">{workOrder.technical_context}</p>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">Implementation Steps</h3>
                            <div className="space-y-2">
                                {workOrder.steps?.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-3 text-sm text-zinc-300">
                                        <span className="font-mono text-zinc-600 shrink-0">{i + 1}.</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {workOrder.code_hints && workOrder.code_hints.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">Reference Code</h3>
                                {workOrder.code_hints.map((hint: any, i: number) => (
                                    <div key={i} className="mb-4">
                                        <p className="text-xs text-zinc-500 font-mono mb-1">{hint.filename}</p>
                                        <pre className="p-3 rounded bg-black border border-zinc-800 text-xs font-mono text-zinc-400 overflow-x-auto">
                                            {hint.snippet}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-4 rounded-lg bg-emerald-950/10 border border-emerald-500/20">
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" /> Acceptance Definition
                            </h3>
                            <ul className="list-disc list-inside space-y-1">
                                {workOrder.acceptance_criteria?.map((crit: string, i: number) => (
                                    <li key={i} className="text-sm text-zinc-300">{crit}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-zinc-800 shrink-0">
                        <button
                            onClick={onComplete}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                        >
                            <CheckCircle className="h-5 w-5" /> Mark Task Complete
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-xs">Waiting for generation...</div>
            )}
        </div>
    );
}
