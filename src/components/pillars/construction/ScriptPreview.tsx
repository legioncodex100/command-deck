
import { FileCode, Loader2, Save } from "lucide-react";

interface ScriptPreviewProps {
    markdown: string;
    isSaving: boolean;
    onSave: () => void;
}

export function ScriptPreview({ markdown, isSaving, onSave }: ScriptPreviewProps) {
    return (
        <div className="h-full flex flex-col bg-black">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-[#27272a] bg-zinc-950/50">
                <div className="flex items-center gap-2 px-2">
                    <FileCode className="h-3 w-3 text-indigo-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Construct Output</span>
                </div>

                <button
                    onClick={onSave}
                    disabled={isSaving || !markdown}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-sm flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm shadow-indigo-500/20"
                >
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save Instructions
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#050505]">
                {markdown ? (
                    <pre className="text-[10px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {markdown}
                    </pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-2">
                        <FileCode className="h-8 w-8 opacity-20" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-700">Waiting for Script</span>
                    </div>
                )}
            </div>
        </div>
    );
}
