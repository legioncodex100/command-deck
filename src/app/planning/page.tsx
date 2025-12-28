"use client";

import { useState } from "react";
import { useProject } from "@/hooks/useProject";
import { generateBacklog } from "@/services/planning";
import { DataBlob, PlayFilled } from "@carbon/icons-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";
import { StageNavigator } from "@/components/StageNavigator";
import { DraftViewer } from "@/components/DraftViewer";

const PLANNING_STAGES = [
    { id: 'INPUTS', label: 'Inputs Sealed' },
    { id: 'MAPPING', label: 'Backlog Mapping' },
    { id: 'REVIEW', label: 'Review & Verify' }
];

export default function PlanningHub() {
    const { activeProject, documents, refreshProject } = useProject();

    const [generating, setGenerating] = useState(false);
    const [backlogDraft, setBacklogDraft] = useState<string>("");

    // Derived state
    const prd = documents.find(d => d.type === 'PRD');
    const strategy = documents.find(d => d.type === 'STRATEGY');
    const hasInputs = !!prd && !!strategy;

    // Determine current stage for navigator
    const completedStages = [];
    if (hasInputs) completedStages.push('INPUTS');
    if (backlogDraft) completedStages.push('MAPPING');

    const handleGenerate = async () => {
        if (!prd || !strategy || generating) return;

        setGenerating(true);
        try {
            const result = await generateBacklog(prd.content, strategy.content);
            setBacklogDraft(result);
        } catch (e) {
            console.error(e);
            alert("Failed to generate backlog. See console.");
        } finally {
            setGenerating(false);
        }
    };

    const handleCommit = async () => {
        if (!activeProject || !backlogDraft) return;

        try {
            // Check existing
            const { data: existing } = await supabase
                .from('documents')
                .select('id')
                .eq('project_id', activeProject.id)
                .eq('type', 'BACKLOG')
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('documents')
                    .update({ content: backlogDraft })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('documents')
                    .insert({
                        project_id: activeProject.id,
                        type: 'BACKLOG',
                        content: backlogDraft
                    });
                if (error) throw error;
            }

            await refreshProject();
            alert("BACKLOG.md saved to Project Vault.");
        } catch (e) {
            console.error(e);
            alert("Failed to save backlog.");
        }
    };

    return (
        <div className="flex h-full gap-6 overflow-hidden">

            {/* COLUMN 1: Inputs Standardized */}
            <aside className="w-64 flex flex-col gap-6 shrink-0 border-r border-zinc-800 pr-4">
                <StageNavigator
                    title="Planning Phase"
                    icon={DataBlob}
                    items={PLANNING_STAGES}
                    completedIds={completedStages}
                />

                <div className="mt-auto p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-md">
                    <h3 className="text-xs font-bold text-emerald-400 mb-2 font-mono uppercase tracking-wider">Instructions</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                        The Mapping Engine will decompose the User Stories in the PRD using the constraints defined in the Strategy. The result is a 10-Phase Backlog.
                    </p>
                </div>
            </aside>

            {/* COLUMN 2: Mapper (Action Center) */}
            <section className="flex-1 flex flex-col border border-zinc-800 rounded-lg bg-[#000000] relative items-center justify-center p-8 text-center text-zinc-400">
                {!backlogDraft ? (
                    <div className="max-w-md space-y-6">
                        <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                            <PlayFilled className="h-8 w-8 text-zinc-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Requirement Mapper</h2>
                            <p className="text-sm text-zinc-500 font-mono">
                                Generate a prioritized backlog by cross-referencing your PRD and Strategy artifacts.
                            </p>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!hasInputs || generating}
                            className={cn(
                                "w-full py-3 rounded-md font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                hasInputs
                                    ? "bg-white text-black hover:bg-zinc-200"
                                    : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                            )}
                        >
                            {generating ? "Mapping Specifications..." : "Run Mapping Engine"}
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col">
                        <div className="mb-4 flex justify-between items-center px-2">
                            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Decomposition Preview</h3>
                            <button onClick={() => setBacklogDraft("")} className="text-xs text-zinc-500 hover:text-white font-mono uppercase tracking-wider">Reset</button>
                        </div>
                        <textarea
                            value={backlogDraft}
                            readOnly
                            className="flex-1 bg-[#050a07] border border-emerald-500/20 rounded-md p-4 font-mono text-xs text-emerald-50/80 focus:outline-none resize-none leading-relaxed"
                        />
                    </div>
                )}
            </section>

            {/* COLUMN 3: Intelligence Panel (Live Draft) */}
            <DraftViewer
                title="Live Backlog"
                content={backlogDraft || "*Awaiting Generation...*"}
                status={backlogDraft ? 'DRAFTING' : 'DRAFTING'}
                canPublish={!!backlogDraft}
                onPublish={handleCommit}
            />

        </div>
    );
}
