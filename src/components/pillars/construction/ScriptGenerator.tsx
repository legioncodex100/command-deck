
import { Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriptGeneratorProps {
    selectedCount: number;
    isGenerating: boolean;
    onGenerate: () => void;
}

export function ScriptGenerator({ selectedCount, isGenerating, onGenerate }: ScriptGeneratorProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden p-8 border-r border-[#27272a]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="z-10 flex flex-col items-center gap-6 max-w-sm text-center">
                <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                    <Zap className={cn("h-8 w-8 transition-colors", selectedCount > 0 ? "text-indigo-500" : "text-zinc-700")} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-white mb-2">Construction Factory</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Convert <span className="text-indigo-400 font-bold">{selectedCount} selected tasks</span> into a step-by-step implementation script.
                    </p>
                </div>

                <div className="w-full space-y-3">
                    <button
                        onClick={onGenerate}
                        disabled={selectedCount === 0 || isGenerating}
                        className={cn(
                            "w-full py-3 rounded-sm font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            selectedCount > 0
                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                                : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" /> Generating Plan...
                            </>
                        ) : (
                            "Generate Work Order"
                        )}
                    </button>

                    {selectedCount > 0 && (
                        <div className="text-[9px] text-zinc-600 uppercase tracking-wider">
                            Target: INSTRUCTIONS.md
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
