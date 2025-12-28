import { cn } from "@/lib/utils";
import { Document as DocumentIcon, Locked } from "@carbon/icons-react";

interface DraftViewerProps {
    title: string;
    content: string;
    status: 'DRAFTING' | 'LOCKED';
    onPublish?: () => void;
    canPublish?: boolean;
    className?: string;
}

export function DraftViewer({ title, content, status, onPublish, canPublish, className }: DraftViewerProps) {
    return (
        <aside className={cn("w-[450px] shrink-0 border border-emerald-500/20 rounded-md bg-[#020402] flex flex-col", className)}>
            {/* Header: Dark Emerald Tint, Flat Border */}
            <div className="p-3 border-b border-emerald-500/20 flex justify-between items-center bg-emerald-950/20">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                    <DocumentIcon className="h-4 w-4" /> {title}
                </h3>
                <button
                    onClick={onPublish}
                    disabled={!canPublish}
                    className={cn(
                        "text-xs px-3 py-1 rounded border flex items-center gap-2 transition-all font-bold font-mono uppercase tracking-wider",
                        canPublish
                            ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500" // Solid Emerald Active
                            : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                    )}
                >
                    {!canPublish && <Locked className="h-3 w-3" />}
                    {canPublish ? "Publish Artifact" : "Draft Locked"}
                </button>
            </div>

            {/* Content Area: Deep Black, Terminal Text */}
            <div
                className="flex-1 overflow-y-auto p-6 text-sm text-emerald-100/90 whitespace-pre-wrap leading-relaxed scrollbar-thin scrollbar-thumb-emerald-900/50 scrollbar-track-transparent"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
                <style jsx>{`
                    .markdown-content strong {
                        color: #34d399; /* emerald-400 */
                        font-weight: 700;
                    }
                    .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                        color: #10b981; /* emerald-500 */
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                    }
                    .markdown-content ul {
                        list-style-type: square;
                        padding-left: 1.2em;
                        color: #6ee7b7;
                    }
                    .markdown-content em {
                        color: #6ee7b7; /* emerald-300 */
                        font-style: normal;
                        border-bottom: 1px dashed #059669;
                    }
                `}</style>
                <div className="markdown-content">
                    {content}
                </div>
            </div>

            {/* Footer: Tech Status Line */}
            <div className="p-2 border-t border-emerald-500/20 bg-emerald-950/30 text-[10px] text-emerald-600/80 font-mono text-center uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full", status === 'DRAFTING' ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
                {status === 'DRAFTING' ? "Live Auto-Sync Active" : "Artifact Immutable"}
            </div>
        </aside>
    );
}
