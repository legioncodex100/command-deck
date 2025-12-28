"use client";

import { X, Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TerminalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    type?: string;
}

export function TerminalModal({ isOpen, onClose, title, content, type = "DOC" }: TerminalModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-3xl bg-[#0a0a0a] border border-emerald-500/30 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#020402] border-b border-emerald-500/20">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500 transition-colors cursor-pointer" onClick={onClose} />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                        </div>
                        <div className="font-mono text-xs text-emerald-500/70 flex items-center gap-2">
                            <Terminal className="w-3 h-3" />
                            <span>~/vault/{type.toLowerCase()}/{title.replace(/\s+/g, '_').toLowerCase()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "p-1.5 rounded hover:bg-emerald-500/10 transition-colors flex items-center gap-2 text-xs font-mono border border-transparent hover:border-emerald-500/20",
                                copied ? "text-emerald-400" : "text-zinc-500 hover:text-emerald-400"
                            )}
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? "COPIED" : "COPY"}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed text-zinc-300 bg-[#050505] selection:bg-emerald-500/30 selection:text-emerald-50 font-ligatures-none">
                    <pre className="whitespace-pre-wrap max-w-full break-words">
                        {content}
                        <span className="inline-block w-2 h-4 align-middle bg-emerald-500 animate-pulse ml-1" />
                    </pre>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
