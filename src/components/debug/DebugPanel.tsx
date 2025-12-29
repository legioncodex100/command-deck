"use client";

import React, { useState, useEffect } from 'react';
import { useDevMode } from '@/hooks/DevModeContext';
import { usePathname } from 'next/navigation';
import { X, Search, Database, Layers, Activity, Sparkles, Copy, LayoutDashboard, Bot, AlertCircle, MousePointerClick } from 'lucide-react';
import { scanFileForSLS, readMasterSpec } from '@/app/actions/auditor';
import { scanForLayoutIssues } from '@/app/actions/layout_auditor';
import { useProject } from '@/hooks/useProject';

export function DebugPanel() {
    const { isDevMode, debugFlags, setDebugFlags, selectedElement } = useDevMode();
    const pathname = usePathname();
    const { documents, activeProjectId } = useProject();
    const [activeTab, setActiveTab] = useState<'CONTEXT' | 'AUDITOR' | 'UI'>('CONTEXT');
    const [auditResult, setAuditResult] = useState<any>(null);
    const [layoutResult, setLayoutResult] = useState<any>(null);
    const [targetFile, setTargetFile] = useState('');
    const [masterSpecContent, setMasterSpecContent] = useState<string>('');

    // Fetch Master Spec on mount
    useEffect(() => {
        if (isDevMode && activeTab === 'CONTEXT') {
            readMasterSpec().then(setMasterSpecContent);
        }
    }, [isDevMode, activeTab]);

    // Auto-detect file path based on route
    useEffect(() => {
        if (!isDevMode) return;

        // Specific functional component overrides (The "Real" Code)
        const pathOverrides: Record<string, string> = {
            '/discovery': 'src/components/pillars/Pillar_A_Discovery.tsx',
            '/strategy': 'src/components/pillars/Pillar_B_Strategy.tsx',
            '/substructure': 'src/components/pillars/Pillar_C_Substructure.tsx',
            '/design': 'src/components/pillars/Pillar_D_Design.tsx',
            '/planning': 'src/components/pillars/Pillar_E_Planning.tsx',
            '/construction': 'src/components/pillars/Pillar_F_Construction.tsx',
            '/integration': 'src/components/pillars/Pillar_G_Integration.tsx'
        };

        let detectedFile = pathOverrides[pathname];

        if (!detectedFile) {
            if (pathname === '/') {
                detectedFile = 'src/app/page.tsx';
            } else {
                // Generic Fallback for standard Next.js routes
                // e.g. /dashboard -> src/app/dashboard/page.tsx
                detectedFile = `src/app${pathname}/page.tsx`;
            }
        }

        if (detectedFile) {
            setTargetFile(detectedFile);
        }
    }, [pathname, isDevMode]);

    if (!isDevMode) return null;

    // Build the "Real" Context Object
    const latestRelay = documents.filter(d => d.type.startsWith('RELAY_')).pop();
    const activeContext = {
        project_id: activeProjectId,
        master_spec_version: masterSpecContent.split('\n')[0] || 'Unknown',
        active_relay: latestRelay ? latestRelay.type : 'NONE',
        relay_preview: latestRelay ? latestRelay.content.substring(0, 100) + '...' : 'N/A'
    };

    const runAudit = async () => {
        if (!targetFile) return;
        const result = await scanFileForSLS(targetFile);
        setAuditResult(result);
    };

    const runLayoutScan = async () => {
        if (!targetFile) return;
        const result = await scanForLayoutIssues(targetFile);
        setLayoutResult(result);
    };

    return (
        <div className="fixed top-20 right-4 w-96 bg-zinc-950 border border-amber-500/50 rounded-lg shadow-2xl z-50 flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="h-10 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-3">
                <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold">
                    <Activity className="h-3 w-3" />
                    HOST_DEBUGGER_v1
                </div>
                <button onClick={() => setDebugFlags(prev => ({ ...prev, showContextInspector: false }))}>
                    <X className="h-4 w-4 text-zinc-500 hover:text-white" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('CONTEXT')}
                    className={`flex-1 py-2 text-xs font-mono ${activeTab === 'CONTEXT' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    CONTEXT
                </button>
                <button
                    onClick={() => setActiveTab('AUDITOR')}
                    className={`flex-1 py-2 text-xs font-mono ${activeTab === 'AUDITOR' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    AUDITOR
                </button>
                <button
                    onClick={() => setActiveTab('UI')}
                    className={`flex-1 py-2 text-xs font-mono ${activeTab === 'UI' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    UI
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'CONTEXT' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                            <h4 className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                                <Database className="h-3 w-3" /> LIVE CONTEXT BUFFER
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-[10px] text-amber-500 font-mono block">SYSTEM PROMPT (AI Constitution)</span>
                                    <div className="text-[10px] text-zinc-400 bg-black p-2 border border-zinc-800 rounded max-h-24 overflow-hidden mb-2">
                                        {masterSpecContent.substring(0, 300) + "..." || "Loading..."}
                                    </div>
                                </div>

                                <div className="border-t border-zinc-800 pt-2">
                                    <span className="text-[10px] text-amber-500 font-mono block mb-1">USER PROJECT CONTEXT (Directors Cut)</span>
                                    {documents.length === 0 ? (
                                        <p className="text-zinc-600 text-[10px] italic">No active artifacts found.</p>
                                    ) : (
                                        documents.map(doc => (
                                            <div key={doc.id} className="mb-2">
                                                <span className="text-[10px] text-blue-400 font-bold block">{doc.type}</span>
                                                <div className="text-[10px] text-zinc-400 bg-black p-2 border border-zinc-800 rounded max-h-20 overflow-hidden">
                                                    {doc.content.substring(0, 150) + "..."}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'AUDITOR' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">Target File (Relative Path)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={targetFile}
                                    onChange={(e) => setTargetFile(e.target.value)}
                                    placeholder="src/components/..."
                                    className="flex-1 bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                                />
                                <button
                                    onClick={runAudit}
                                    className="bg-amber-600 hover:bg-amber-500 text-black px-3 py-1 rounded text-xs font-bold"
                                >
                                    SCAN
                                </button>
                            </div>
                        </div>

                        {auditResult && (
                            <div className={`p-3 border rounded text-xs ${auditResult.valid ? 'bg-green-950/20 border-green-800 text-green-400' : 'bg-red-950/20 border-red-800 text-red-400'}`}>
                                {auditResult.error ? (
                                    <p>{auditResult.error}</p>
                                ) : (
                                    <>
                                        <p className="font-bold mb-1">Status: {auditResult.valid ? 'PASS' : 'FAIL'}</p>
                                        <p>Lines: {auditResult.lineCount}</p>
                                        {auditResult.violations.length > 0 && (
                                            <ul className="mt-2 list-disc pl-4 space-y-1 mb-3">
                                                {auditResult.violations.map((v: string, i: number) => (
                                                    <li key={i}>{v}</li>
                                                ))}
                                            </ul>
                                        )}

                                        {!auditResult.valid && (
                                            <div className="mt-3 pt-3 border-t border-red-500/20">
                                                <p className="font-bold text-amber-500 mb-2 flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3" /> RECOMMENDED FIX PROMPT
                                                </p>
                                                <div className="bg-black p-2 rounded border border-amber-500/30 font-mono text-[10px] text-zinc-300 select-all">
                                                    {(() => {
                                                        const isLength = auditResult.violations.some((v: string) => v.includes("File length"));
                                                        const isSLS = auditResult.violations.some((v: string) => v.includes("Supabase"));

                                                        let prompt = `Fix the architectural violations in ${targetFile} listed above.`;
                                                        if (isLength) prompt = `Refactor ${targetFile} by extracting sub-components and moving hooks to a separate file to reduce line count below 150 lines. Maintain existing functionality.`;
                                                        if (isSLS) prompt = `Refactor ${targetFile} to move direct Supabase calls to a server action or service layer to comply with Strict Layer Separation.`;

                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <span id={`fix-prompt-${targetFile}`}>{prompt}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(prompt);
                                                                    }}
                                                                    className="ml-auto p-1 hover:bg-amber-500/20 rounded text-amber-500 transition-colors"
                                                                    title="Copy Prompt"
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'UI' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                            <h4 className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                                <LayoutDashboard className="h-3 w-3" /> VIEWPORT MONITOR
                            </h4>
                            <div className="text-2xl font-mono text-white mb-1">
                                {typeof window !== 'undefined' ? `${window.innerWidth}px` : '---'}
                            </div>
                            <div className="flex gap-2 text-[10px] font-mono text-zinc-500">
                                <span className={typeof window !== 'undefined' && window.innerWidth >= 640 ? 'text-green-500' : ''}>SM</span>
                                <span className={typeof window !== 'undefined' && window.innerWidth >= 768 ? 'text-green-500' : ''}>MD</span>
                                <span className={typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'text-green-500' : ''}>LG</span>
                                <span className={typeof window !== 'undefined' && window.innerWidth >= 1280 ? 'text-green-500' : ''}>XL</span>
                                <span className={typeof window !== 'undefined' && window.innerWidth >= 1536 ? 'text-green-500' : ''}>2XL</span>
                            </div>
                        </div>

                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between">
                            <div>
                                <h4 className="text-zinc-400 text-xs font-bold flex items-center gap-2">
                                    <Layers className="h-3 w-3" /> STRUCTURE X-RAY
                                </h4>
                                <p className="text-[10px] text-zinc-500">Visualize component boundaries</p>
                            </div>
                            <button
                                onClick={() => setDebugFlags(prev => ({ ...prev, xRayMode: !prev.xRayMode }))}
                                className={`w-10 h-5 rounded-full relative transition-colors ${debugFlags.xRayMode ? 'bg-amber-500' : 'bg-zinc-700'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${debugFlags.xRayMode ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>

                        {/* Component Inspector Display */}
                        {debugFlags.xRayMode && (
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded animate-in fade-in slide-in-from-right-4">
                                <h4 className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                                    <MousePointerClick className="h-3 w-3 text-emerald-500" /> INSPECTOR
                                </h4>
                                <div className="text-xs text-zinc-300">
                                    {selectedElement ? (
                                        <div className="space-y-2">
                                            {selectedElement.component && (
                                                <div>
                                                    <span className="text-zinc-500 text-[10px] block">COMPONENT</span>
                                                    <span className="font-mono text-emerald-400 font-bold">{selectedElement.component}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-zinc-500 text-[10px] block">ELEMENT</span>
                                                    <span className="font-mono text-zinc-300 bg-zinc-800 px-1 rounded">&lt;{selectedElement.tag}&gt;</span>
                                                </div>
                                                {selectedElement.id && (
                                                    <div>
                                                        <span className="text-zinc-500 text-[10px] block">ID</span>
                                                        <span className="font-mono text-zinc-300">#{selectedElement.id}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {selectedElement.classes && (
                                                <div>
                                                    <span className="text-zinc-500 text-[10px] block">CLASSES</span>
                                                    <div className="text-[10px] text-zinc-400 font-mono break-all leading-tight bg-black p-1 rounded border border-zinc-800 mt-0.5">
                                                        {selectedElement.classes}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-zinc-600 italic text-[10px]">
                                            Shift + Click any element to identify...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Layout AI Diagnostics */}
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                            <h4 className="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                                <Bot className="h-3 w-3 text-emerald-500" /> LAYOUT GUARDIAN (AI)
                            </h4>
                            {!layoutResult ? (
                                <button
                                    onClick={runLayoutScan}
                                    className="w-full py-2 bg-emerald-900/20 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Search className="h-3 w-3" /> ANALYZE CURRENT VIEW
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${layoutResult.valid ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {layoutResult.valid ? 'STRUCTURE HEALTHY' : 'ISSUES DETECTED'}
                                        </span>
                                        <button onClick={() => setLayoutResult(null)} className="text-[10px] text-zinc-500 hover:text-white">RESET</button>
                                    </div>

                                    {layoutResult.violations?.length > 0 && (
                                        <div className="space-y-2">
                                            {layoutResult.violations.map((v: string, i: number) => (
                                                <div key={i} className="text-[10px] text-zinc-300 bg-black/50 p-2 rounded border border-amber-500/20 flex gap-2">
                                                    <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                                                    {v}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {layoutResult.suggestions?.length > 0 && (
                                        <div className="bg-emerald-950/10 p-2 rounded border border-emerald-500/20">
                                            <p className="text-[10px] text-emerald-500 font-bold mb-1">SUGGESTED OPTIMIZATIONS</p>
                                            <ul className="list-disc pl-3 text-[10px] text-emerald-400/80 space-y-1">
                                                {layoutResult.suggestions.map((s: string, i: number) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {layoutResult.detectedComponents?.length > 0 && (
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-bold mb-1">DETECTED COMPONENTS</p>
                                            <div className="flex flex-wrap gap-1">
                                                {layoutResult.detectedComponents.map((c: string, i: number) => (
                                                    <span key={i} className="text-[9px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {layoutResult.fixPrompt && (
                                        <div className="mt-3 pt-3 border-t border-amber-500/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-amber-500 text-[10px] flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3" /> AI REPAIR PROMPT
                                                </p>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(layoutResult.fixPrompt)}
                                                    className="text-amber-500 hover:bg-amber-500/10 p-1 rounded transition-colors"
                                                    title="Copy Prompt"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="bg-black p-2 rounded border border-amber-500/30 font-mono text-[9px] text-zinc-400 select-all whitespace-pre-wrap max-h-24 overflow-y-auto custom-scrollbar">
                                                {layoutResult.fixPrompt}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
