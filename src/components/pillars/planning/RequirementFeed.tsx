import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { FileText } from "lucide-react";
import { PillarPanel, PillarHeader, PillarBody } from "../ui";
import { usePillarTheme } from "../PillarProvider";

interface RequirementFeedProps {
    prd: string;
    className?: string;
    onClose?: () => void;
}

export function RequirementFeed({ prd, className, onClose }: RequirementFeedProps) {
    const theme = usePillarTheme();

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={FileText}
                title="Requirements Feed"
                onClose={onClose}
            />

            <PillarBody>
                <div className="p-4">
                    {prd ? (
                        <div className={`prose prose-invert prose-sm max-w-none prose-headings:${theme.text} prose-headings:font-bold prose-headings:uppercase prose-p:text-zinc-400 prose-li:text-zinc-400 prose-strong:text-zinc-200`}>
                            <ReactMarkdown>{prd}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-xs gap-2 mt-10">
                            <FileText className="h-8 w-8 opacity-20" />
                            No PRD content found.
                        </div>
                    )}
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
