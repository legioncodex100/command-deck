import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { FileText, X } from "lucide-react";

interface RequirementFeedProps {
    prd: string;
    className?: string;
    onClose?: () => void;
}

export function RequirementFeed({ prd, className, onClose }: RequirementFeedProps) {
    return (
        <div className={cn("h-full flex flex-col border-r border-[#27272a] bg-black/50 overflow-hidden", className)}>
            <div className="p-3 border-b border-[#27272a] bg-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Requirements Feed</h3>
                </div>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="lg:hidden p-1 text-zinc-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {prd ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-emerald-400 prose-headings:font-bold prose-headings:uppercase prose-p:text-zinc-400 prose-li:text-zinc-400 prose-strong:text-zinc-200">
                        <ReactMarkdown>{prd}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-xs gap-2">
                        <FileText className="h-8 w-8 opacity-20" />
                        No PRD content found.
                    </div>
                )}
            </div>
        </div>
    );
}
