"use client";

import { useState } from "react";
import { useAuditor } from "@/hooks/useAuditor";
import { Loader2, ShieldAlert, CheckCircle, AlertTriangle, XCircle, Terminal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuditorLab() {
    const [code, setCode] = useState("");
    const { isAuditing, error, scanResult, performAudit } = useAuditor();

    const handleAudit = () => {
        if (!code.trim()) return;
        performAudit(code);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Projects / MatFlow / Auditor Lab</div>
                    <h1 className="text-3xl font-bold tracking-tight">Structural Auditor</h1>
                </div>
                <button
                    onClick={handleAudit}
                    disabled={isAuditing || !code.trim()}
                    className={cn(
                        "bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                        isAuditing && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isAuditing && <Loader2 className="animate-spin h-4 w-4" />}
                    {isAuditing ? "Scanning Integrity..." : "Run Audit Scan"}
                </button>
            </header>

            {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md mb-4 text-sm">
                    Error: {error}
                </div>
            )}

            {/* Split Pane: Code Input vs Results */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 border border-border rounded-lg overflow-hidden bg-card">

                {/* Left: Code Input */}
                <div className="flex flex-col border-r border-border">
                    <div className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 p-3 text-xs font-mono uppercase flex items-center gap-2">
                        <Terminal className="h-3 w-3" /> Source Code Input
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 w-full bg-zinc-950 text-zinc-300 p-6 font-mono text-sm resize-none focus:outline-none"
                        placeholder="// Paste React/TypeScript code here for analysis..."
                        spellCheck={false}
                    />
                </div>

                {/* Right: Results Dashboard */}
                <div className="flex flex-col bg-secondary/10">
                    <div className="bg-secondary/30 border-b border-border p-3 text-xs font-mono text-muted-foreground uppercase flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Analysis Report
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {!scanResult ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                Ready to scan.
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {/* Score Card */}
                                <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-md">
                                    <div className={cn(
                                        "text-4xl font-bold",
                                        scanResult.score >= 90 ? "text-green-500" :
                                            scanResult.score >= 70 ? "text-yellow-500" : "text-destructive"
                                    )}>
                                        {scanResult.score}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">Integrity Score</div>
                                        <div className="text-xs text-muted-foreground">
                                            {scanResult.score >= 90 ? "Excellent. Modular & Clean." :
                                                scanResult.score >= 70 ? "Acceptable. Minor warnings." : "Critical. Immediate Refactor Required."}
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="bg-secondary/50 p-4 rounded-md text-sm border-l-4 border-primary">
                                    <div className="font-medium mb-1">AI Recommendation</div>
                                    <div className="text-muted-foreground">{scanResult.recommendation}</div>
                                </div>

                                {/* Violations List */}
                                <div>
                                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <ShieldAlert className="h-4 w-4" /> Detected Violations
                                    </h3>
                                    {scanResult.violations.length === 0 ? (
                                        <div className="text-sm text-green-500 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" /> No violations detected.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {scanResult.violations.map((v, i) => (
                                                <div key={i} className="bg-card border border-border p-3 rounded-md flex gap-3 text-sm">
                                                    {v.severity === "High" && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                                                    {v.severity === "Medium" && <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />}
                                                    {v.severity === "Low" && <Activity className="h-5 w-5 text-blue-500 shrink-0" />}

                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={cn(
                                                                "text-xs px-1.5 py-0.5 rounded font-medium border",
                                                                v.severity === "High" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                                    v.severity === "Medium" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                                                        "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                            )}>
                                                                {v.severity}
                                                            </span>
                                                            {v.line && <span className="text-xs text-muted-foreground font-mono">Line {v.line}</span>}
                                                        </div>
                                                        <div className="text-foreground">{v.message}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
