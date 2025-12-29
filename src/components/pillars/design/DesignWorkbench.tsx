
import { useState } from "react";
import { Copy, ArrowRight, Code, Dna, Upload, Loader2, Sparkles, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface DesignWorkbenchProps {
    mode: 'PROMPT' | 'RECONCILE' | 'SPEC';
    setMode: (mode: 'PROMPT' | 'RECONCILE' | 'SPEC') => void;
    stitchPrompt: string;
    reconciledCode: string; // The text in the reconciliation area
    designDoc: string; // The text in the spec area
    onCodeChange: (code: string) => void;
    onDesignDocChange: (doc: string) => void;
    onGeneratePrompt: () => void;
    onExtractDNA: () => void;
    isGenerating: boolean;
    isExtracting: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export function DesignWorkbench({
    mode, setMode, stitchPrompt, reconciledCode, designDoc, onCodeChange, onDesignDocChange,
    onGeneratePrompt, onExtractDNA, isGenerating, isExtracting, saveStatus
}: DesignWorkbenchProps) {

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mode === 'SPEC' ? designDoc : stitchPrompt);
        alert("Content copied to clipboard");
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] relative overflow-hidden">
            {/* Workbench Header - Tabs Only */}
            <div className="flex items-center p-3 border-b border-[#27272a] bg-zinc-950">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMode('PROMPT')}
                        className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-colors",
                            mode === 'PROMPT' ? "text-indigo-400" : "text-zinc-600 hover:text-indigo-400/50"
                        )}
                    >
                        <Sparkles className="h-4 w-4" /> Stitch Prompt
                    </button>
                    <div className="h-4 w-px bg-[#27272a]" />
                    <button
                        onClick={() => setMode('SPEC')}
                        className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-colors",
                            mode === 'SPEC' ? "text-purple-400" : "text-zinc-600 hover:text-purple-400/50"
                        )}
                    >
                        <FileText className="h-4 w-4" /> Live Spec
                    </button>
                    <div className="h-4 w-px bg-[#27272a]" />
                    <button
                        onClick={() => setMode('RECONCILE')}
                        className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-colors",
                            mode === 'RECONCILE' ? "text-emerald-400" : "text-zinc-600 hover:text-emerald-400/50"
                        )}
                    >
                        <Code className="h-4 w-4" /> Reconciliation
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative font-mono text-sm">
                {mode === 'PROMPT' ? (
                    <div className="absolute inset-0 p-6 overflow-auto custom-scrollbar">
                        {stitchPrompt ? (
                            <div className="text-zinc-300 leading-relaxed max-w-4xl prose prose-invert prose-headings:text-indigo-400 prose-strong:text-indigo-300 prose-p:text-zinc-300 prose-li:text-zinc-300">
                                <ReactMarkdown>{stitchPrompt}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                                <Sparkles className="h-10 w-10 opacity-20" />
                                <p>No prompt generated. Click 'Generate' to engineer the prompt.</p>
                            </div>
                        )}
                    </div>
                ) : mode === 'SPEC' ? (
                    <div className="absolute inset-0 flex flex-col">
                        <textarea
                            className="flex-1 bg-[#09090b] text-purple-100/90 p-6 resize-none focus:outline-none placeholder:text-zinc-800 leading-relaxed"
                            placeholder="# Design Specification (Live)..."
                            value={designDoc}
                            onChange={(e) => onDesignDocChange(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col">
                        <div className="bg-emerald-950/20 border-b border-emerald-900/20 p-2 text-center text-[10px] uppercase text-emerald-500/60 font-bold">
                            Paste Google Stitch HTML/Tailwind Output Here
                        </div>
                        <textarea
                            className="flex-1 bg-[#09090b] text-emerald-100/90 p-6 resize-none focus:outline-none placeholder:text-zinc-800 leading-relaxed"
                            placeholder="<div class='bg-zinc-950 border border-zinc-800 rounded-md p-4'>...</div>"
                            value={reconciledCode}
                            onChange={(e) => onCodeChange(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end p-3 border-t border-[#27272a] bg-zinc-950">
                <div className="flex items-center gap-2 mr-2">
                    {/* Save Status Indicator */}
                    {saveStatus === 'saving' && <span className="text-[10px] text-zinc-500 animate-pulse">Saving...</span>}
                    {saveStatus === 'saved' && <span className="text-[10px] text-emerald-500/80">Saved</span>}
                    {saveStatus === 'error' && <span className="text-[10px] text-red-500">Save Failed</span>}

                    {/* Divider */}
                    <div className="h-3 w-px bg-zinc-800 mx-2" />

                    {mode === 'PROMPT' ? (
                        <div className="flex gap-2">
                            <button
                                onClick={onGeneratePrompt}
                                disabled={isGenerating}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                Generate Prompt
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="px-3 py-1.5 border border-[#27272a] hover:border-indigo-500/50 text-zinc-400 hover:text-indigo-400 text-[10px] font-bold uppercase rounded-sm flex items-center gap-2 transition-all"
                            >
                                <Copy className="h-3 w-3" /> Copy
                            </button>
                        </div>
                    ) : mode === 'SPEC' ? (
                        <div className="flex gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest py-1.5 px-2 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse" />
                                Live Output
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="px-3 py-1.5 border border-[#27272a] hover:border-purple-500/50 text-zinc-400 hover:text-purple-400 text-[10px] font-bold uppercase rounded-sm flex items-center gap-2 transition-all"
                            >
                                <Copy className="h-3 w-3" /> Copy Doc
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onExtractDNA}
                            disabled={!reconciledCode || isExtracting}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-bold uppercase rounded-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isExtracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Dna className="h-3 w-3" />}
                            Extract DNA & Lock
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
