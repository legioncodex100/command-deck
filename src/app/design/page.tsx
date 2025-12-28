"use client";

import { useState, useEffect, useRef } from "react";
import { useProject } from "@/hooks/useProject";
import { generateDesignTokens, analyzeVisualContext } from "@/services/design";
import { supabase } from "@/services/supabase";
import { Loader2, Palette, PenTool, Upload, Image as ImageIcon, Send, ArrowRight, CheckCircle, Lock, Layout, Type, Layers, Zap, Save, FileText, Trash2, X, Maximize2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecommendationBanner } from "@/components/RecommendationBanner";
import { parseDesignResources } from "@/services/design_parser";

export default function DesignStudio() {
    const { activeProject, activeProjectId } = useProject();

    // State
    const [prdContext, setPrdContext] = useState<string>("");
    const [strategyContext, setStrategyContext] = useState<string>("");
    const [schemaContext, setSchemaContext] = useState<string>("");
    const [designDoc, setDesignDoc] = useState<string>("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string, recommendation?: any }[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageAnalysis, setImageAnalysis] = useState<string>("");

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Loading States
    const [isLoadingContext, setIsLoadingContext] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [isGeneratingTokens, setIsGeneratingTokens] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Resource Collection State
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [resources, setResources] = useState<{ colors: { name: string, value: string }[], typography: { name: string, value: string }[] }>({ colors: [], typography: [] });

    // Update resources when designDoc changes
    useEffect(() => {
        if (designDoc) {
            const parsed = parseDesignResources(designDoc);
            setResources(parsed);
        }
    }, [designDoc]);

    // UI Tabs
    const [activeTab, setActiveTab] = useState<'DESIGN' | 'PRD' | 'STRATEGY' | 'SCHEMA'>('DESIGN');

    // Stage Gate
    const isLocked = !activeProject || (activeProject.current_stage !== 'DESIGN' && activeProject.current_stage !== 'SUBSTRUCTURE' && activeProject.current_stage !== 'CONSTRUCTION' && activeProject.current_stage !== 'AUDIT' && activeProject.current_stage !== 'HANDOVER');

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isGeneratingTokens]);

    const loadContext = async () => {
        setIsLoadingContext(true);
        // Load PRD
        const { data: prd } = await supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'PRD').order('created_at', { ascending: false }).limit(1).single();
        if (prd) setPrdContext(prd.content);

        // Load Strategy
        const { data: strategy } = await supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'STRATEGY').order('created_at', { ascending: false }).limit(1).single();
        if (strategy) setStrategyContext(strategy.content);

        // Load Schema
        const { data: schema } = await supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'SCHEMA').order('created_at', { ascending: false }).limit(1).single();
        if (schema) setSchemaContext(schema.content);

        // Load Existing Design
        const { data: design } = await supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'DESIGN').order('created_at', { ascending: false }).limit(1).single();
        if (design) setDesignDoc(design.content);

        // Load Persistent Chat History
        const { data: logs } = await supabase.from('consultation_logs').select('messages').eq('project_id', activeProjectId).eq('pillar', 'DESIGN').single();

        if (logs) {
            // If a log entry exists, respect it (even if empty)
            setChatHistory(logs.messages || []);
        } else {
            // Smart Initialization: Only if no history row exists at all
            try {
                // Initialize with a hidden "system" trigger for the AI
                const initHistory = [{
                    role: 'user' as const,
                    text: `Review the PRD, Strategy, and Schema.
                    
                    First, introduce yourself as the Creative Director and provide a concise summary of the 6-Stage Design Track we will follow:
                    1. Domain & Strategy (Aligning visuals with business goals)
                    2. Schema-UX Mapping (Data density & layout topology)
                    3. Aesthetic Philosophy (Vibe, mood, and sensory impact)
                    4. Atomic DNA (Colors, Typography, Radius, Shadows)
                    5. Stitch Synthesis (Compiling the master design system)
                    6. Reconciliation (Final review against requirements)

                    Explain briefly what happens in each.
                    
                    Then, immediately move to Stage 1: Propose 3 distinct aesthetic directions (e.g., "Minimalist Swiss", "Cyberpunk Terminal", "Corporate SaaS") suitable for this domain.`
                }];

                // We use the variables captured in closure, but we need to ensure we have the strings
                // Since state updates are async, we use the values we fetched
                const contextData = {
                    prd: prd?.content || "",
                    strategy: strategy?.content || "",
                    schema: schema?.content || "",
                    imageAnalysis: ""
                };

                if (contextData.prd) {
                    setIsGeneratingTokens(true); // Show loading state on chat
                    const result = await generateDesignTokens(contextData, initHistory);

                    const welcomeMsg = {
                        role: 'model' as const,
                        text: result.message,
                        recommendation: result.consultant_recommendation
                    };

                    const newHistory = [welcomeMsg]; // We don't show the hidden trigger prompt to user, just the result
                    setChatHistory(newHistory);

                    // Persist
                    await supabase.from('consultation_logs').upsert({
                        project_id: activeProjectId!,
                        pillar: 'DESIGN',
                        messages: newHistory
                    }, { onConflict: 'project_id, pillar' });
                } else {
                    // Fallback if no PRD
                    setChatHistory([{
                        role: 'model',
                        text: "I'm ready to design, but I need a PRD first. Please ensure the Discovery Phase is complete."
                    }]);
                }
            } catch (err) {
                console.error("Init failed", err);
                setChatHistory([{
                    role: 'model',
                    text: "Creative Director online. Ready to review your context."
                }]);
            } finally {
                setIsGeneratingTokens(false);
            }
        }

        setIsLoadingContext(false);
    };

    useEffect(() => {
        if (activeProjectId) loadContext();
    }, [activeProjectId]);



    const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64 = reader.result as string;
                        setUploadedImage(base64);
                        setIsAnalyzingImage(true);
                        try {
                            const analysis = await analyzeVisualContext(base64);
                            setImageAnalysis(analysis);
                            setChatHistory(prev => [...prev, { role: 'model', text: `I've analyzed the pasted image. It appears to be: ${analysis}` }]);
                        } catch (err) {
                            console.error(err);
                            alert("Failed to analyze image.");
                        } finally {
                            setIsAnalyzingImage(false);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setUploadedImage(base64);
            setIsAnalyzingImage(true);
            try {
                // Analyze immediately
                const analysis = await analyzeVisualContext(base64);
                setImageAnalysis(analysis);
                setChatHistory(prev => [...prev, { role: 'model', text: `I've analyzed the uploaded image. It appears to be: ${analysis}` }]);
            } catch (err) {
                console.error(err);
                alert("Failed to analyze image.");
            } finally {
                setIsAnalyzingImage(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateTokens = async (payload?: string) => {
        if (!prdContext) return;

        let currentHistory = [...chatHistory];

        // If payload exists, it comes from a user action (Manual "Generate" click)
        if (payload) {
            const userMsg = { role: 'user' as const, text: payload };
            currentHistory = [...chatHistory, userMsg];
            setChatHistory(currentHistory);
            await supabase.from('consultation_logs').upsert({
                project_id: activeProjectId!,
                pillar: 'DESIGN',
                messages: currentHistory
            }, { onConflict: 'project_id, pillar' });
        }

        setIsGeneratingTokens(true);
        try {
            const result = await generateDesignTokens({ prd: prdContext, strategy: strategyContext, schema: schemaContext, imageAnalysis }, currentHistory);

            // Handle Structured Response
            const newMessage: { role: 'model', text: string, recommendation?: any } = {
                role: 'model',
                text: result.message || "I've updated the design context.",
                recommendation: result.consultant_recommendation
            };

            const finalHistory = [...currentHistory, newMessage];
            setChatHistory(finalHistory);

            // If the message contains a full markdown artifact (detected by header), update the live doc
            if (result.message && (result.message.includes("# Design System") || result.message.includes("## 1. Brand Identity"))) {
                setDesignDoc(result.message);
                setActiveTab('DESIGN');
            }

            // Handle Stitch Prompt Artifact
            if (result.stitch_prompt) {
                // Check if Stitch Prompt exists
                const { data: existingStitch } = await supabase.from('documents').select('id').eq('project_id', activeProjectId!).eq('type', 'STITCH_PROMPT').single();

                if (existingStitch) {
                    await supabase.from('documents').update({
                        content: result.stitch_prompt,
                        title: 'Master Stitch Prompt',
                        summary: 'High-fidelity synthesis prompt for Google Stitch.'
                    }).eq('id', existingStitch.id);
                } else {
                    await supabase.from('documents').insert({
                        project_id: activeProjectId!,
                        type: 'STITCH_PROMPT',
                        content: result.stitch_prompt,
                        title: 'Master Stitch Prompt',
                        summary: 'High-fidelity synthesis prompt for Google Stitch.'
                    });
                }
            }

            await supabase.from('consultation_logs').upsert({
                project_id: activeProjectId!,
                pillar: 'DESIGN',
                messages: finalHistory
            }, { onConflict: 'project_id, pillar' });

        } catch (e) {
            console.error(e);
            alert("Failed to generate design tokens.");
        } finally {
            setIsGeneratingTokens(false);
        }
    };

    const handleDecision = async (optionLabel: string) => {
        // Treat decision as a user message
        const choiceText = `I choose: ${optionLabel}`;
        await handleGenerateTokens(choiceText);
    };

    const handleSaveDesign = async () => {
        if (!designDoc) return;
        setIsSaving(true);
        try {
            // First check if exists
            const { data: existing } = await supabase.from('documents').select('id').eq('project_id', activeProjectId!).eq('type', 'DESIGN').single();

            if (existing) {
                await supabase.from('documents').update({
                    content: designDoc,
                    title: 'Design System',
                    summary: 'Visual identity and tokens.'
                }).eq('id', existing.id);
            } else {
                await supabase.from('documents').insert({
                    project_id: activeProjectId!,
                    type: 'DESIGN',
                    content: designDoc,
                    title: 'Design System',
                    summary: 'Visual identity and tokens.'
                });
            }
            alert("Design System Saved!");
        } catch (e) {
            console.error(e);
            alert("Save failed.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearChat = async () => {
        if (!confirm("Are you sure you want to clear the design session history?")) return;

        try {
            const defaultMessage = [{
                role: 'model' as const,
                text: "Creative Director online. Ready to review your context."
            }];

            // Soft delete: Reset to default welcome message
            await supabase.from('consultation_logs')
                .upsert({
                    project_id: activeProjectId!,
                    pillar: 'DESIGN',
                    messages: defaultMessage
                }, { onConflict: 'project_id, pillar' });

            // Reset local state
            setChatHistory(defaultMessage);

            // Reload context to potentially trigger smart init or just reset
            loadContext();
        } catch (err) {
            console.error("Failed to clear chat", err);
            alert("Failed to clear session.");
        }
    };

    return (
        <div className="h-full flex flex-col p-4 gap-6 max-w-[1600px] mx-auto overflow-hidden bg-black font-mono">


            {isLocked && (
                <RecommendationBanner
                    title="Prerequisites Missing"
                    description="Ensure Strategy is complete before defining Visual Design."
                    linkHref="/strategy"
                    linkText="Go to Strategy"
                />
            )}

            <div className="flex-1 flex flex-col gap-6 min-h-0">

                {/* Top Horizontal Timeline (Design Track) */}
                {/* Top Horizontal Timeline (Design Track) - Standardized */}
                <div className="shrink-0 mb-6 bg-[#020402] border border-emerald-500/20 rounded-lg p-2 flex items-center justify-between shadow-sm shadow-emerald-900/10">
                    <div className="flex items-center gap-3 px-4 py-2 border-r border-emerald-500/20">
                        <Layers className="h-4 w-4 text-emerald-500" />
                        <h2 className="font-bold text-[10px] uppercase tracking-wider text-emerald-100/90">Design Track</h2>
                    </div>
                    <div className="flex-1 flex justify-around px-4">
                        {[
                            { id: 1, label: "Domain & Strategy" },
                            { id: 2, label: "Schema-UX Mapping" },
                            { id: 3, label: "Aesthetic Philosophy" },
                            { id: 4, label: "Atomic DNA" },
                            { id: 5, label: "Stitch Synthesis" },
                            { id: 6, label: "Reconciliation" }
                        ].map((step, idx) => (
                            <div key={step.id} className={cn("flex items-center gap-2 px-3 py-1.5 rounded transition-all", idx === 0 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "text-emerald-700/60 hover:text-emerald-400 border border-transparent")}>
                                <div className={cn("h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold", idx === 0 ? "border border-emerald-500 bg-emerald-500/20" : "border border-emerald-900/30 bg-emerald-900/10")}>
                                    {step.id}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wide hidden xl:inline-block">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                    {/* COLUMN 1: Resource Collection (Minimized) - Matching Discovery's Sidebar */}
                    <aside className="col-span-2 flex flex-col gap-6 shrink-0 pr-4 border-r border-zinc-800">
                        {/* Mock Stage Navigator Header for visual consistency */}
                        <div className="flex items-center gap-3 p-2 text-zinc-400">
                            <Palette className="h-5 w-5" />
                            <span className="font-bold text-sm tracking-tight text-white">Design Assets</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-3 min-h-0">
                            <div
                                onClick={() => setShowResourceModal(true)}
                                className="h-full p-3 bg-[#020402] border border-emerald-500/20 rounded-md cursor-pointer group hover:border-emerald-500/50 transition-all flex flex-col relative overflow-hidden shadow-sm shadow-emerald-900/5"
                            >
                                <label className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-3 block flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> Resource Link
                                    </span>
                                    <Maximize2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                                </label>

                                <div className="space-y-4">
                                    {/* Mini Color Preview */}
                                    <div>
                                        <div className="text-[9px] uppercase tracking-widest text-emerald-600/60 mb-1.5 font-bold flex items-center gap-1">
                                            Palette DNA
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {resources.colors.length > 0 ? resources.colors.slice(0, 6).map((c, i) => (
                                                <div key={i} className="h-4 w-4 rounded-full border border-zinc-700/50 shadow-sm" style={{ backgroundColor: c.value }} title={c.name} />
                                            )) : (
                                                <div className="text-[10px] text-zinc-600 italic">No colors extracted</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mini Type Preview */}
                                    <div>
                                        <div className="text-[9px] uppercase tracking-widest text-emerald-600/60 mb-1.5 font-bold flex items-center gap-1">
                                            Typography
                                        </div>
                                        <div className="space-y-1">
                                            {resources.typography.length > 0 ? resources.typography.slice(0, 2).map((t, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Type className="h-3 w-3 text-emerald-700" />
                                                    <span className="text-[10px] text-emerald-200/60 truncate font-mono">{t.value}</span>
                                                </div>
                                            )) : (
                                                <div className="text-[10px] text-zinc-600 italic">No fonts defined</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-2 border-t border-emerald-500/10 text-center">
                                    <span className="text-[9px] text-emerald-700/60 font-bold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Open Collection</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Resource Modal - Tweaked Theme */}
                    {showResourceModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                            <div className="bg-[#020402] border border-emerald-500/30 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative shadow-emerald-900/20">
                                <button
                                    onClick={() => setShowResourceModal(false)}
                                    className="absolute top-4 right-4 text-emerald-700/50 hover:text-emerald-400 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="p-6 border-b border-emerald-500/20 bg-emerald-950/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Palette className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white tracking-tight">Design Resource Collection</h2>
                                            <p className="text-xs text-emerald-500/60 uppercase tracking-widest mt-1">Extracted from Live Design System</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    {/* Colors */}
                                    <section>
                                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <div className="h-1 w-4 bg-emerald-500 rounded-full"></div>
                                            Color Palette
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {resources.colors.map((c, i) => (
                                                <div key={i} className="flex item-center gap-3 p-3 rounded bg-zinc-900/30 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                                                    <div className="h-10 w-10 rounded border border-zinc-700 shadow-inner shrink-0" style={{ backgroundColor: c.value }}></div>
                                                    <div className="flex flex-col justify-center min-w-0">
                                                        <span className="text-xs font-bold text-emerald-100 truncate">{c.name}</span>
                                                        <span className="text-[10px] font-mono text-emerald-500/60">{c.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {resources.colors.length === 0 && <p className="text-zinc-500 text-xs italic">No colors extracted yet.</p>}
                                        </div>
                                    </section>

                                    <div className="h-px bg-emerald-500/10"></div>

                                    {/* Typography */}
                                    <section>
                                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <div className="h-1 w-4 bg-emerald-500 rounded-full"></div>
                                            Typography
                                        </h3>
                                        <div className="space-y-3">
                                            {resources.typography.map((t, i) => (
                                                <div key={i} className="p-4 rounded bg-zinc-900/30 border border-emerald-500/10 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-wider mb-1">{t.name}</span>
                                                        <span className="text-lg text-emerald-50">{t.value}</span>
                                                    </div>
                                                    <div className="h-8 w-8 rounded flex items-center justify-center bg-zinc-900 border border-emerald-500/10">
                                                        <Type className="h-4 w-4 text-emerald-500" />
                                                    </div>
                                                </div>
                                            ))}
                                            {resources.typography.length === 0 && <p className="text-zinc-500 text-xs italic">No typography defined yet.</p>}
                                        </div>
                                    </section>
                                </div>

                                <div className="p-4 border-t border-emerald-500/20 bg-emerald-950/10 flex justify-end">
                                    <button onClick={() => setShowResourceModal(false)} className="px-4 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider transition-colors">Close Collection</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COLUMN 2: Creative Workbench - 50% - Standardized */}
                    <div className="col-span-6 bg-[#020402] border border-emerald-500/20 rounded-lg flex flex-col overflow-hidden relative shadow-sm shadow-emerald-900/10">
                        <div className="absolute top-0 left-0 right-0 p-3 bg-zinc-950/50 backdrop-blur-sm border-b border-emerald-500/20 z-10 flex justify-between items-center">
                            <h2 className="font-bold text-[10px] uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                Live Creative Session
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleClearChat}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                    title="Clear Session"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleGenerateTokens("Initialize 6-Stage Master Track")}
                                    disabled={isGeneratingTokens || !prdContext}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50 rounded-sm"
                                >
                                    {isGeneratingTokens ? <Loader2 className="h-3 w-3 animate-spin" /> : <Layout className="h-3 w-3" />}
                                    Generate
                                </button>
                            </div>
                        </div>


                        <div className="flex-1 p-4 overflow-y-auto space-y-6 mt-10 scrollbar-hide font-mono text-sm leading-relaxed">
                            {/* Chat / Interaction Area */}
                            {chatHistory.length === 0 && !uploadedImage && (
                                <div className="h-full flex flex-col items-center justify-center text-emerald-800/40 gap-4">
                                    <Layout className="h-12 w-12 stroke-[1px]" />
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase tracking-widest mb-2 text-emerald-700/60">Creative Direction // Offline</p>
                                        <p className="text-xs text-emerald-800/60">Upload UI references or initialize generation.</p>
                                    </div>
                                    <label className="cursor-pointer px-4 py-2 bg-emerald-950/10 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-600 hover:text-emerald-400 transition-all text-[10px] uppercase tracking-wider font-bold flex items-center gap-2 rounded-sm">
                                        <Upload className="h-3 w-3" />
                                        Upload Reference
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            )}

                            {uploadedImage && (
                                <div className="flex flex-col gap-2 p-3 border border-emerald-500/20 border-l-2 border-l-emerald-500 bg-emerald-900/10">
                                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">System // Visual Context</div>
                                    <img src={uploadedImage} alt="Uploaded Ref" className="max-h-48 object-contain self-start border border-zinc-800 opacity-80 hover:opacity-100 transition-opacity" />
                                    {isAnalyzingImage ? (
                                        <div className="flex items-center gap-2 text-[10px] text-emerald-400 animate-pulse mt-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Scanning Visual DNA...
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1">
                                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                                            Context Acquired
                                        </div>
                                    )}
                                </div>
                            )}

                            {chatHistory.map((msg, i) => (
                                <div key={i} className={cn("flex flex-col gap-1 w-full max-w-full overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? "items-end" : "items-start")}>
                                    <span className={cn("text-[9px] uppercase font-bold tracking-wider mb-1", msg.role === 'user' ? "text-zinc-600 mr-1" : "text-emerald-500/80 ml-1")}>
                                        {msg.role === 'user' ? 'Operator' : 'Creative Director'}
                                    </span>
                                    <div className={cn("p-0 text-sm whitespace-pre-wrap break-words leading-relaxed shadow-sm relative max-w-[90%] overflow-hidden bg-transparent",
                                        msg.role === 'user'
                                            ? "text-zinc-300 text-right"
                                            : "text-emerald-50/90"
                                    )}>
                                        {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                            part.match(/^https?:\/\//)
                                                ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline break-all">{part}</a>
                                                : part
                                        )}
                                    </div>

                                    {/* Auto-Parse Lists into Radio Selections (if no structured recommendation) */}
                                    {!msg.recommendation && (msg.text.match(/^[*-] .+/m)) && (
                                        <div className="mt-4 w-full bg-emerald-950/20 border border-emerald-500/20 rounded-lg overflow-hidden backdrop-blur-sm">
                                            <div className="p-3 bg-emerald-900/10 border-b border-emerald-500/10 flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-emerald-400" />
                                                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Suggested Actions</span>
                                            </div>
                                            <div className="p-2 grid gap-2">
                                                {msg.text.split('\n').filter(line => line.trim().match(/^[*-] /)).map((line, idx) => {
                                                    const cleanLabel = line.replace(/^[*-] /, '').trim();
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleDecision(cleanLabel)}
                                                            className="flex items-center gap-3 p-3 rounded bg-black/40 border border-emerald-900/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-left"
                                                        >
                                                            <div className="h-4 w-4 rounded-full border border-emerald-500/50 flex items-center justify-center shrink-0">
                                                                <div className="h-2 w-2 rounded-full bg-emerald-500 opacity-0 hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <span className="text-xs font-bold text-emerald-600 hover:text-emerald-400 flex-1">{cleanLabel}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Decision Cards Render (Strategy Style) */}
                                    {msg.recommendation && (
                                        <div className="mt-4 w-full bg-emerald-950/20 border border-emerald-500/20 rounded-lg overflow-hidden backdrop-blur-sm">
                                            <div className="p-3 bg-emerald-900/10 border-b border-emerald-500/10 flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-emerald-400" />
                                                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Design Recommendation</span>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {msg.recommendation.context && (
                                                    <p className="text-xs text-emerald-200/80 italic border-l-2 border-emerald-500/50 pl-3">
                                                        "{msg.recommendation.context}"
                                                    </p>
                                                )}

                                                <div className="grid grid-cols-1 gap-3">
                                                    {msg.recommendation.options.map((opt: any) => (
                                                        <div key={opt.id || opt.label} className={cn(
                                                            "p-3 rounded border transition-all text-left group flex flex-col h-full",
                                                            opt.recommended
                                                                ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                                                                : "bg-black/40 border-emerald-900/30 hover:border-emerald-500/30"
                                                        )}>
                                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                                <span className={cn(
                                                                    "text-xs font-bold",
                                                                    opt.recommended ? "text-emerald-300" : "text-emerald-600"
                                                                )}>
                                                                    {opt.label}
                                                                </span>
                                                                {opt.recommended && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono uppercase tracking-tight">Preferred</span>}
                                                            </div>
                                                            <p className="text-[11px] text-zinc-500 leading-relaxed mb-3 flex-1 relative">
                                                                {/* Visual Color Preview */}
                                                                {(opt.label.match(/#[0-9a-fA-F]{6}/) || opt.description.match(/#[0-9a-fA-F]{6}/)) && (
                                                                    <span className="block mt-1 mb-2 h-6 w-12 rounded-md border border-zinc-800 shadow-sm transition-transform hover:scale-105"
                                                                        style={{ backgroundColor: (opt.label.match(/#[0-9a-fA-F]{6}/) || opt.description.match(/#[0-9a-fA-F]{6}/))![0] }}
                                                                    />
                                                                )}

                                                                {/* Visual Font Preview */}
                                                                {(msg.recommendation.context?.toLowerCase().includes("typography") || msg.recommendation.context?.toLowerCase().includes("font")) ? (
                                                                    <span className="block text-lg mt-2 mb-2 p-2 bg-zinc-950/50 rounded border border-zinc-800" style={{ fontFamily: opt.label.split(" - ")[0] }}>
                                                                        Space: the final frontier. To boldly go where no man has gone before.
                                                                    </span>
                                                                ) : null}

                                                                {opt.description}
                                                            </p>
                                                            <button
                                                                onClick={() => handleDecision(opt.label)}
                                                                className={cn(
                                                                    "w-full py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors flex items-center justify-center gap-2 mt-auto",
                                                                    opt.recommended
                                                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                                                                        : "bg-transparent border-zinc-800 text-zinc-500 hover:border-emerald-500/50 hover:text-emerald-400"
                                                                )}
                                                            >
                                                                Select Option
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {msg.role === 'model' && <div className="h-px w-full bg-emerald-500/10 my-4" />}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 border-t border-emerald-500/20 bg-emerald-950/10">
                            <div className="flex gap-2 items-end bg-black border border-emerald-500/20 p-2 focus-within:border-emerald-500/50 transition-colors rounded-md">
                                <div className="h-full flex items-center justify-center px-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></div>
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent text-sm text-zinc-300 focus:outline-none py-2 font-mono placeholder:text-zinc-700"
                                    placeholder="Command the Director..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onPaste={handlePaste}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && inputMessage.trim()) {
                                            const msg = inputMessage.trim();
                                            setInputMessage("");
                                            await handleGenerateTokens(msg);
                                        }
                                    }}
                                />
                                <button className="px-3 py-1 bg-emerald-900/20 border border-emerald-500/20 text-emerald-600 hover:text-emerald-400 hover:border-emerald-500/50 text-[10px] uppercase font-bold tracking-wider transition-all h-8 rounded-sm">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 3: Context Panel - 33% - Standardized */}
                    {/* COLUMN 3: Context Panel - 33% - Terminal Styled */}
                    <div className="col-span-4 bg-black border border-emerald-500/20 rounded-lg flex flex-col overflow-hidden shadow-sm shadow-emerald-900/10 relative">
                        {/* Terminal Header */}
                        {/* Terminal Header - Standardized */}
                        <div className="flex items-center justify-between p-3 border-b border-emerald-500/20 bg-zinc-950/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-emerald-500" />
                                <span className="font-mono text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
                                    LIVE {activeTab} DRAFT
                                </span>
                            </div>

                            {/* Tabs Integrated into Header Right */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setActiveTab('DESIGN')}
                                    className={cn("px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-colors", activeTab === 'DESIGN' ? "bg-emerald-500/20 text-emerald-400" : "text-emerald-800 hover:text-emerald-600")}
                                >
                                    DSGN
                                </button>
                                <button
                                    onClick={() => setActiveTab('STRATEGY')}
                                    className={cn("px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-colors", activeTab === 'STRATEGY' ? "bg-emerald-500/20 text-emerald-400" : "text-emerald-800 hover:text-emerald-600")}
                                >
                                    STRAT
                                </button>
                                <button
                                    onClick={() => setActiveTab('PRD')}
                                    className={cn("px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-colors", activeTab === 'PRD' ? "bg-emerald-500/20 text-emerald-400" : "text-emerald-800 hover:text-emerald-600")}
                                >
                                    PRD
                                </button>
                            </div>

                            {activeTab === 'DESIGN' && (
                                <button
                                    onClick={handleSaveDesign}
                                    disabled={isSaving}
                                    className="ml-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all shadow-sm shadow-emerald-500/20"
                                >
                                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                    Publish Artifact
                                </button>
                            )}
                        </div>

                        {/* Terminal Content Body */}
                        <div className="flex-1 overflow-y-auto bg-black p-0 relative font-mono text-xs">
                            {activeTab === 'DESIGN' ? (
                                designDoc ? (
                                    <textarea
                                        className="w-full h-full bg-transparent p-6 text-emerald-50 resize-none focus:outline-none leading-relaxed placeholder:text-emerald-900/50"
                                        value={designDoc}
                                        onChange={(e) => setDesignDoc(e.target.value)}
                                        spellCheck={false}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-emerald-900/40 gap-3">
                                        <div className="h-16 w-16 border border-dashed border-emerald-900/30 rounded flex items-center justify-center animate-pulse">
                                            <div className="h-2 w-2 bg-emerald-900 rounded-full" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold">Artifact Buffer Empty</p>
                                    </div>
                                )
                            ) : activeTab === 'PRD' ? (
                                <div className="p-6">
                                    <pre className="whitespace-pre-wrap text-emerald-400/80 leading-relaxed">
                                        {prdContext || "// No PRD context loaded."}
                                    </pre>
                                </div>
                            ) : activeTab === 'STRATEGY' ? (
                                <div className="p-6">
                                    <pre className="whitespace-pre-wrap text-emerald-400/80 leading-relaxed">
                                        {strategyContext || "// No Strategy context loaded."}
                                    </pre>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <pre className="whitespace-pre-wrap text-emerald-400/80 leading-relaxed">
                                        {schemaContext || "// No Schema context loaded."}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Status Footer */}
                        <div className="p-2 border-t border-emerald-500/20 bg-[#020402] flex items-center justify-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Live Auto-Sync Active</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
