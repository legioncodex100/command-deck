"use client";

import { useProject } from "@/hooks/useProject";
import { ArrowRight, CheckCircle, Lock, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MissionTracker() {
    const { activeProject, missionStatus, isLoading } = useProject();

    if (isLoading || !activeProject) return null;

    const { nextBestAction, progress } = missionStatus;

    // Helper to determine link based on stage
    const getActionLink = () => {
        switch (activeProject.current_stage) {
            case 'DISCOVERY': return '/discovery';
            case 'AUDIT': return '/audit';
            case 'HANDOVER': return '/knowledge-base';
            default: return '/';
        }
    };

    return (
        <div className="w-full bg-card border-b border-border p-4 mb-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Rocket className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Current Mission Stage
                            </div>
                            <div className="text-lg font-bold flex items-center gap-2">
                                {activeProject.current_stage}
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({progress}% Complete)
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={getActionLink()}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors bg-blue-600"
                    >
                        <span>Execute: {nextBestAction}</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out bg-blue-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
