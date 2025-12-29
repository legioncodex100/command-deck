
import { useState } from "react";
import { FileText, Database, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesignContextProps {
    prd: string;
    strategy: string;
    schema: string;
}

export function DesignContext({ prd, strategy, schema }: DesignContextProps) {
    const [activeTab, setActiveTab] = useState<'PRD' | 'STRATEGY' | 'SCHEMA'>('PRD');

    return (
        <div className="h-full flex flex-col bg-black border-l border-[#27272a]">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-[#27272a] bg-zinc-950/50">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">Intelligence</span>
                <div className="flex bg-black rounded-md p-0.5 border border-[#27272a]">
                    <button
                        onClick={() => setActiveTab('PRD')}
                        className={cn("px-2 py-1 text-[9px] font-bold rounded-sm flex items-center gap-1 transition-all", activeTab === 'PRD' ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-600 hover:text-zinc-400")}
                    >
                        <Target className="h-3 w-3" /> PRD
                    </button>
                    <button
                        onClick={() => setActiveTab('STRATEGY')}
                        className={cn("px-2 py-1 text-[9px] font-bold rounded-sm flex items-center gap-1 transition-all", activeTab === 'STRATEGY' ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-600 hover:text-zinc-400")}
                    >
                        <FileText className="h-3 w-3" /> STRAT
                    </button>
                    <button
                        onClick={() => setActiveTab('SCHEMA')}
                        className={cn("px-2 py-1 text-[9px] font-bold rounded-sm flex items-center gap-1 transition-all", activeTab === 'SCHEMA' ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-600 hover:text-zinc-400")}
                    >
                        <Database className="h-3 w-3" /> DATA
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <pre className="text-[10px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                    {activeTab === 'PRD' && (prd || "No PRD Indexed.")}
                    {activeTab === 'STRATEGY' && (strategy || "No Strategy Indexed.")}
                    {activeTab === 'SCHEMA' && (schema || "No Schema Indexed.")}
                </pre>
            </div>
        </div>
    );
}
