"use client";

import { useState } from "react";
import { useProject } from "@/hooks/useProject";
import { generateStitchPrompt, extractDesignTokens, DesignPreferences } from "@/services/facade";
import { supabase } from "@/services/supabase";
import { Loader2, Sparkles, Copy, Code, CheckCircle, Lock, ArrowRight, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecommendationBanner } from "@/components/RecommendationBanner";

export default function FacadeStudio() {
    const { activeProject, activeProjectId, updateStage, missionStatus } = useProject();
    const [mood, setMood] = useState("Modern Professional");
    const [density, setDensity] = useState<DesignPreferences['density']>('Default');
    const [radius, setRadius] = useState<DesignPreferences['radius']>('Subtle');
    const [description, setDescription] = useState("");

    // Prompt Gen State
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

    // Extraction State
    const [stitchCode, setStitchCode] = useState("");
    const [extractedTokens, setExtractedTokens] = useState<any>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Stage Gate
    const isLocked = activeProject?.current_stage === 'DISCOVERY'; // Only unlocked from DESIGN onwards
    // Note: isLocked variable is now just for the banner, not blocking return.

    // REMOVED BLOCKING RETURN

    const handleGeneratePrompt = async () => {
        setIsGeneratingPrompt(true);
        try {
            const result = await generateStitchPrompt({ mood, density, radius, description });
            setGeneratedPrompt(result);
        } catch (e) {
            console.error(e);
            alert("Failed to generate prompt.");
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const handleExtract = async () => {
        if (!stitchCode) return;
        setIsExtracting(true);
        try {
            const tokens = await extractDesignTokens(stitchCode);
            setExtractedTokens(tokens);
        } catch (e) {
            console.error(e);
            alert("Failed to extract tokens. Ensure you pasted valid HTML/CSS.");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSyncDNA = async () => {
        if (!extractedTokens || !activeProjectId) return;
        setIsSyncing(true);
        try {
            // Save to Documents
            const content = `
# Design DNA

**Synced from Facade Studio**

## Tokens
\`\`\`json
${JSON.stringify(extractedTokens, null, 2)}
\`\`\`
            `;

            await supabase.from('documents').insert({
                project_id: activeProjectId,
                type: 'DESIGN', // Ensure this type exists in your DB check or using a generic type if allowed
                content: content
            });

            // Trigger Stage Update
            await updateStage('SUBSTRUCTURE');

            alert("DNA Synced! Moving to Substructure Phase.");
        } catch (e) {
            console.error(e);
            alert("Failed to sync DNA.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 gap-6 max-w-7xl mx-auto">
            <header className="mb-2">
                <div className="text-sm font-medium text-muted-foreground mb-1">Mission Step 2</div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Palette className="h-8 w-8 text-purple-500" />
                    Facade Architect
                </h1>
                <p className="text-muted-foreground">Bridge visual intent from Google Stitch to your Project DNA.</p>
            </header>

            {isLocked && (
                <RecommendationBanner
                    title="Prerequisite Recommended: Discovery"
                    description="You are designing the Facade before completing Discovery. It is recommended to have a PRD first."
                    linkHref="/discovery"
                    linkText="Go to Discovery Lab"
                />
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* Left: Prompt Generator */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 shadow-sm overflow-y-auto">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        1. Stitch Prompt Generator
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Visual Mood</label>
                            <input
                                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 mt-1 text-sm"
                                placeholder="e.g. Dark Sci-Fi, Clean Medical, Vibrant Fintech..."
                                value={mood}
                                onChange={e => setMood(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Density</label>
                                <select
                                    className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 mt-1 text-sm"
                                    value={density}
                                    onChange={(e: any) => setDensity(e.target.value)}
                                >
                                    <option>Compact</option>
                                    <option>Default</option>
                                    <option>Spacious</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Corner Radius</label>
                                <select
                                    className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 mt-1 text-sm"
                                    value={radius}
                                    onChange={(e: any) => setRadius(e.target.value)}
                                >
                                    <option>Sharp</option>
                                    <option>Subtle</option>
                                    <option>Round</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Additional Context</label>
                            <textarea
                                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 mt-1 text-sm resize-none h-20"
                                placeholder="Any specific layout requirements or inspirations..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleGeneratePrompt}
                            disabled={isGeneratingPrompt}
                            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            {isGeneratingPrompt && <Loader2 className="h-4 w-4 animate-spin" />}
                            Generate Prompt for Stitch
                        </button>
                    </div>

                    {generatedPrompt && (
                        <div className="mt-4 bg-secondary/20 border border-border rounded-md p-4 relative group">
                            <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                                {generatedPrompt}
                            </pre>
                            <button
                                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                                className="absolute top-2 right-2 p-1.5 bg-background border border-border rounded hover:bg-secondary transition-colors"
                                title="Copy"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Importer & Extractor */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 shadow-sm overflow-y-auto">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-500" />
                        2. DNA Extraction (Reverse Engineer)
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Paste the code exported from Google Stitch here. We will extract the variables.
                    </p>

                    <textarea
                        className="w-full flex-1 min-h-[200px] bg-zinc-950 text-zinc-300 border border-border rounded-md p-4 font-mono text-xs resize-none"
                        placeholder="Paste HTML/Tailwind Code here..."
                        value={stitchCode}
                        onChange={e => setStitchCode(e.target.value)}
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleExtract}
                            disabled={isExtracting || !stitchCode}
                            className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-md font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                        >
                            {isExtracting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Analyze Code
                        </button>
                    </div>

                    {extractedTokens && (
                        <div className="mt-4 border-t border-border pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-green-500 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" /> DNA Extracted
                                </h3>
                                <button
                                    onClick={handleSyncDNA}
                                    disabled={isSyncing}
                                    className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                    Sync DNA & Unlock Substructure
                                </button>
                            </div>

                            <div className="bg-secondary/20 p-3 rounded text-xs font-mono max-h-40 overflow-auto">
                                <pre>{JSON.stringify(extractedTokens, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
