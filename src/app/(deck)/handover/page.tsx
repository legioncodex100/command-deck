"use client";

import { useState } from "react";
import { useProject } from "@/hooks/useProject";
import { auditCode, AuditResult } from "@/services/auditor";
import { generateTechSpec, generateUserGuide } from "@/services/documentation";
import { updateMemoryFile, updateDocsFolder } from "@/app/actions/files";
import { ShieldCheck, FileText, Save, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HandoverStudio() {
    const { activeProjectId } = useProject();

    const [activeTab, setActiveTab] = useState<"auditor" | "docs">("auditor");

    // Auditor State
    const [auditCodeInput, setAuditCodeInput] = useState("");
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);

    // Docs State
    const [isGenerating, setIsGenerating] = useState(false);
    const [docStatus, setDocStatus] = useState<string>("");

    // Memory State
    const [sessionLog, setSessionLog] = useState("");
    const [isWrapping, setIsWrapping] = useState(false);

    const handleAudit = async () => {
        if (!auditCodeInput.trim()) return;
        setIsAuditing(true);
        try {
            const result = await auditCode(auditCodeInput);
            setAuditResult(result);
        } catch (e) {
            console.error(e);
            alert("Audit failed.");
        } finally {
            setIsAuditing(false);
        }
    };

    const handleGenerateDocs = async (type: 'TECH_SPEC' | 'USER_GUIDE') => {
        if (!activeProjectId) return;
        setIsGenerating(true);
        try {
            // In a real app we'd fetch blueprint context here. 
            // For MVP let's assume we pass a placeholder or previously fetched context.
            // Simplified: Just triggering the service with a placeholder string to prove connectivity.
            const placeholderContext = "Project Context Placeholder";

            const content = type === 'TECH_SPEC'
                ? await generateTechSpec(placeholderContext)
                : await generateUserGuide(placeholderContext);

            // Sync to local
            await updateDocsFolder([{ name: `${type}.md`, content }]);
            setDocStatus(`${type} generated and synced!`);
        } catch (e) {
            console.error(e);
            setDocStatus("Generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSessionWrap = async () => {
        if (!sessionLog.trim()) return;
        setIsWrapping(true);
        try {
            await updateMemoryFile(sessionLog);
            alert("Session logged to MEMORY.md");
            setSessionLog("");
        } catch (e) {
            alert("Wrap failed.");
        } finally {
            setIsWrapping(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Save className="h-8 w-8 text-purple-500" />
                    Handover Studio
                </h1>
                <p className="text-muted-foreground">Audit, Document, and Persist your mission.</p>
            </header>

            <div className="flex gap-4 border-b border-border">
                <button
                    onClick={() => setActiveTab("auditor")}
                    className={cn("pb-2 px-4 text-sm font-medium border-b-2 transition-colors", activeTab === "auditor" ? "border-purple-500 text-purple-500" : "border-transparent text-muted-foreground hover:text-foreground")}
                >
                    Structural Auditor
                </button>
                <button
                    onClick={() => setActiveTab("docs")}
                    className={cn("pb-2 px-4 text-sm font-medium border-b-2 transition-colors", activeTab === "docs" ? "border-blue-500 text-blue-500" : "border-transparent text-muted-foreground hover:text-foreground")}
                >
                    Doc Engine & Memory
                </button>
            </div>

            {activeTab === "auditor" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                    <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium flex justify-between">
                            <span>Code Input</span>
                            <button onClick={handleAudit} disabled={isAuditing || !auditCodeInput} className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50">
                                {isAuditing ? "Scanning..." : "Run Audit"}
                            </button>
                        </div>
                        <textarea
                            value={auditCodeInput}
                            onChange={e => setAuditCodeInput(e.target.value)}
                            className="flex-1 bg-zinc-950 text-zinc-300 font-mono text-xs p-4 rounded-md resize-none border border-zinc-800 focus:outline-none focus:border-purple-500"
                            placeholder="// Paste component code here check for SLS violations..."
                        />
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            Inspection Report
                        </h3>
                        {auditResult ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn("text-4xl font-bold", auditResult.score > 80 ? "text-green-500" : "text-red-500")}>
                                        {auditResult.score}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Integrity Score
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {auditResult.violations.map((v, i) => (
                                        <div key={i} className="p-3 bg-secondary/30 rounded border border-border text-sm flex gap-3">
                                            <AlertTriangle className={cn("h-4 w-4 shrink-0", v.severity === 'High' ? "text-red-500" : "text-yellow-500")} />
                                            <div>
                                                <div className="font-medium text-foreground">{v.message}</div>
                                                {v.line && <div className="text-xs text-muted-foreground mt-1">Line {v.line}</div>}
                                            </div>
                                        </div>
                                    ))}
                                    {auditResult.violations.length === 0 && (
                                        <div className="text-green-500 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" /> No violations detected.
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-md text-sm">
                                    <strong>Recommendation:</strong> {auditResult.recommendation}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                Ready to scan.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "docs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Documentation Engine
                        </h3>
                        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
                            <p className="text-sm text-muted-foreground">Generate and sync guides to your local /docs folder.</p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleGenerateDocs('TECH_SPEC')}
                                    disabled={isGenerating}
                                    className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded border border-border text-sm font-medium transition-colors"
                                >
                                    Generate Developer Guide (TECH_SPEC.md)
                                </button>
                                <button
                                    onClick={() => handleGenerateDocs('USER_GUIDE')}
                                    disabled={isGenerating}
                                    className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded border border-border text-sm font-medium transition-colors"
                                >
                                    Generate User Help (USER_GUIDE.md)
                                </button>
                            </div>
                            {isGenerating && <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Processing...</div>}
                            {docStatus && <div className="text-xs text-green-500 flex items-center gap-2"><CheckCircle className="h-3 w-3" /> {docStatus}</div>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Save className="h-5 w-5 text-green-500" />
                            Session Wrap
                        </h3>
                        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
                            <p className="text-sm text-muted-foreground">Log your session notes to persist context.</p>
                            <textarea
                                value={sessionLog}
                                onChange={e => setSessionLog(e.target.value)}
                                className="w-full h-32 bg-secondary/30 p-3 rounded text-sm resize-none focus:outline-none border border-transparent focus:border-green-500"
                                placeholder="- Completed Phase 12..."
                            />
                            <button
                                onClick={handleSessionWrap}
                                disabled={isWrapping || !sessionLog}
                                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {isWrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Commit to Memory
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
