"use client";

import { useMemory } from "@/hooks/useMemory";
import { Loader2, Box, ClipboardCopy, Archive, ShieldCheck, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ProjectMemory() {
    const { timeline, isLoading, error, generateContextExport, refresh } = useMemory();
    const [copied, setCopied] = useState(false);

    const handleExport = () => {
        const text = generateContextExport();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Projects / MatFlow / Project Memory</div>
                    <h1 className="text-3xl font-bold tracking-tight">The Archive</h1>
                </div>
                <button
                    onClick={handleExport}
                    className={cn(
                        "bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                        copied && "text-green-600"
                    )}
                >
                    <ClipboardCopy className="h-4 w-4" />
                    {copied ? "Context Copied!" : "Export Context for Agent"}
                </button>
            </header>

            {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md mb-4 text-sm">
                    Error: {error}
                </div>
            )}

            <div className="flex-1 bg-card border border-border rounded-lg p-6 overflow-y-auto">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        <p>Accessing Isolinear Chips...</p>
                    </div>
                ) : timeline.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Archive className="h-12 w-12 opacity-20" />
                        <p>No memory records found. Generate a blueprint or run an audit to initialize history.</p>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto relative pl-8 border-l border-border space-y-8 py-4">
                        {timeline.map((event, idx) => (
                            <div key={event.id} className="relative">
                                {/* Timeline Dot */}
                                <span className={cn(
                                    "absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-background",
                                    event.type === "blueprint" ? "bg-blue-500" : "bg-purple-500"
                                )} />

                                <div className="bg-secondary/10 border border-border rounded-lg p-4 hover:bg-secondary/20 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {event.type === "blueprint" ? <FileJson className="h-4 w-4 text-blue-500" /> : <ShieldCheck className="h-4 w-4 text-purple-500" />}
                                            <span className="font-semibold text-foreground">
                                                {event.type === "blueprint" ? "Technical Blueprint Generated" : "Structural Audit Performed"}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {new Date(event.date).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="text-sm text-foreground font-medium mb-2">
                                        {event.summary}
                                    </div>

                                    {/* Details Preview */}
                                    <div className="bg-background/50 p-2 rounded text-xs font-mono text-muted-foreground max-h-24 overflow-hidden relative">
                                        {JSON.stringify(event.details, null, 2)}
                                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/50 to-transparent" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
