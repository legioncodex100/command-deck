"use client";

import { useProject } from "@/hooks/useProject";
import { Sparkles, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MissionStatusBanner() {
    const { activeProject, missionStatus } = useProject();

    if (!activeProject) return null;

    // Determine status color based on if it's a recommendation or critical
    const isRecommended = missionStatus?.isRecommended;

    // Simple logic: if recommendation exists, show it.

    return (
        <div className={cn(
            "w-full p-4 rounded-md border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all",
            isRecommended
                ? "bg-blue-500/5 border-blue-500/20"
                : "bg-[#0a0a0a] border-zinc-800"
        )}>
            <div className="flex items-start gap-4">
                <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border",
                    isRecommended
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-zinc-900 text-zinc-500 border-zinc-800"
                )}>
                    <Sparkles className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-zinc-100">
                        Mission Status: {activeProject.current_stage}
                        {isRecommended && <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">Action Required</span>}
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-xl">
                        {missionStatus?.nextBestAction || "All systems nominal. Proceed with current tasks."}
                    </p>
                </div>
            </div>

            {missionStatus?.isRecommended && (
                <Link
                    href={missionStatus.nextActionLink || "#"}
                    className="whitespace-nowrap px-4 py-2 bg-zinc-100 text-black hover:bg-white rounded-md font-medium text-sm transition-colors flex items-center gap-2"
                >
                    Exec: {missionStatus.nextActionLabel || "Proceed"}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}
