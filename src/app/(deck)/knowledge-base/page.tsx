"use client";

import { useState } from "react";
import { useProject } from "@/hooks/useProject";
import { useBlueprint } from "@/hooks/useBlueprint";
import { generateTechSpec, generateUserGuide } from "@/services/documents";
import { Loader2, FileText, CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";
import { RecommendationBanner } from "@/components/RecommendationBanner";
import { ProjectVault } from "@/components/ProjectVault";

export default function KnowledgeBase() {
    const { activeProject, activeProjectId, updateStage } = useProject();
    const { blueprint } = useBlueprint(); // Ideally this might need a fetch if not just generated

    // MVP State:
    const [isGeneratingTS, setIsGeneratingTS] = useState(false);
    const [isGeneratingUG, setIsGeneratingUG] = useState(false);
    const [tsDone, setTsDone] = useState(false);
    const [ugDone, setUgDone] = useState(false);

    // UNLOCKED: Replaced with Banner logic
    const isLocked = activeProject?.current_stage !== 'HANDOVER' && activeProject?.current_stage !== 'MAINTENANCE';

    // Helper to fetch latest blueprint content if hook state is empty
    // For MVP, we assume the user has recently generated a blueprint or we disable this.
    // Ideally, we'd have a useLatestBlueprint hook. Let's assume we can't generate without context.

    const handleGenerateTS = async () => {
        setIsGeneratingTS(true);
        try {
            // Fetch latest blueprint string for context
            const { data: bpData } = await supabase
                .from('blueprints')
                .select('content')
                .eq('project_id', activeProjectId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!bpData) throw new Error("No blueprint found to generate docs from.");

            const content = await generateTechSpec(JSON.stringify(bpData.content));

            await supabase.from('documents').insert({
                project_id: activeProjectId,
                type: 'TECH_SPEC',
                content
            });
            setTsDone(true);
        } catch (e) {
            console.error(e);
            alert("Failed to generate Tech Spec.");
        } finally {
            setIsGeneratingTS(false);
        }
    };

    const handleGenerateUG = async () => {
        setIsGeneratingUG(true);
        try {
            // Fetch latest blueprint/PRD for context
            const { data: bpData } = await supabase
                .from('blueprints')
                .select('content')
                .eq('project_id', activeProjectId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!bpData) throw new Error("No blueprint found.");

            const content = await generateUserGuide(JSON.stringify(bpData.content));

            await supabase.from('documents').insert({
                project_id: activeProjectId,
                type: 'USER_GUIDE',
                content
            });
            setUgDone(true);
        } catch (e) {
            console.error(e);
            alert("Failed to generate User Guide.");
        } finally {
            setIsGeneratingUG(false);
        }
    };

    const handleCompleteProject = async () => {
        if (!confirm("Are you sure you want to mark this project as Complete?")) return;
        await updateStage('MAINTENANCE');
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground mt-2">
                    Generate final documentation for handover.
                </p>
            </header>

            {isLocked && (
                <RecommendationBanner
                    title="Prerequisite Recommended: Handover"
                    description="You are accessing the Knowledge Base early. Ensure construction and audit are complete."
                    linkHref="/audit"
                    linkText="Go to Auditor"
                />
            )}

            {/* Project Vault */}
            <div className="mb-8">
                <ProjectVault />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tech Spec Card */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Developer Guide</h2>
                        <p className="text-sm text-muted-foreground">Technical specifications, schema, and logic maps.</p>
                    </div>
                    <button
                        onClick={handleGenerateTS}
                        disabled={isGeneratingTS || tsDone}
                        className={cn(
                            "mt-auto flex items-center justify-center gap-2 py-2 rounded-md font-medium transition-colors",
                            tsDone ? "bg-green-500/10 text-green-500" : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {isGeneratingTS && <Loader2 className="h-4 w-4 animate-spin" />}
                        {tsDone ? (<><CheckCircle className="h-4 w-4" /> Generated</>) : "Generate Tech Spec"}
                    </button>
                </div>

                {/* User Guide Card */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">User Manual</h2>
                        <p className="text-sm text-muted-foreground">Feature walkthroughs and FAQ based on the PRD.</p>
                    </div>
                    <button
                        onClick={handleGenerateUG}
                        disabled={isGeneratingUG || ugDone}
                        className={cn(
                            "mt-auto flex items-center justify-center gap-2 py-2 rounded-md font-medium transition-colors",
                            ugDone ? "bg-green-500/10 text-green-500" : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {isGeneratingUG && <Loader2 className="h-4 w-4 animate-spin" />}
                        {ugDone ? (<><CheckCircle className="h-4 w-4" /> Generated</>) : "Generate User Guide"}
                    </button>
                </div>
            </div>

            {/* Complete Project */}
            {activeProject?.current_stage === 'HANDOVER' && tsDone && ugDone && (
                <div className="border-t border-border pt-8 mt-8 text-center">
                    <p className="text-muted-foreground mb-4">All documentation generated. Ready to launch?</p>
                    <button
                        onClick={handleCompleteProject}
                        className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Complete Mission & Enter Maintenance Mode
                    </button>
                </div>
            )}
        </div>
    );
}
