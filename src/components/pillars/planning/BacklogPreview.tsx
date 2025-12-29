
import { FileText, Save, Loader2 } from "lucide-react";

interface BacklogPreviewProps {
    markdown: string;
    onSave: () => void;
    isSaving: boolean;
}

export function BacklogPreview({ markdown, onSave, isSaving }: BacklogPreviewProps) {
    return (
        <div className="h-full flex flex-col bg-black border-l border-[#27272a]">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-[#27272a] bg-zinc-950/50">
                <div className="flex items-center gap-2 px-2">
                    <FileText className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Artifact</span>
                </div>

                <button
                    onClick={onSave}
                    disabled={isSaving || !markdown}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-bold uppercase rounded-sm flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm shadow-emerald-500/20"
                >
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Commit Backlog
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {markdown ? (
                    <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                        {markdown}
                    </pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-2">
                        <FileText className="h-8 w-8 opacity-20" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Waiting for Mapper</span>
                    </div>
                )}
            </div>
        </div>
    );
}
