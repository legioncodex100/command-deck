"use client";

import { useState } from "react";
import { useProject } from "@/hooks/useProject";
import { HardDrive, RefreshCw, CheckCircle, FileText, Server, Terminal } from "lucide-react";
import { runSyncOperation, SyncStatus } from "@/services/integration";
import StandardPillarLayout from './StandardPillarLayout';
import { PillarPanel, PillarHeader, PillarBody, PillarCard } from './ui';
import { usePillarTheme } from './PillarProvider';

interface PillarGProps {
    onComplete?: () => void;
}

export function Pillar_G_Integration({ onComplete }: PillarGProps) {
    const { documents } = useProject();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<SyncStatus | null>(null);
    const [syncLog, setSyncLog] = useState<string[]>([]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await runSyncOperation(documents);
            setLastSyncResult(result);
            if (result.success && result.logEntry) {
                setSyncLog(prev => [result.logEntry!, ...prev]);
            }
        } catch (e) {
            console.error(e);
            setLastSyncResult({ success: false, error: "Sync failed unexpectedly." });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <StandardPillarLayout
            themeColor="emerald"
            leftContent={<VirtualStatePanel documents={documents} />}
            mainContent={
                <IntegrationBridgePanel
                    isSyncing={isSyncing}
                    handleSync={handleSync}
                    lastSyncResult={lastSyncResult}
                />
            }
            rightContent={
                <SyncLogPanel
                    syncLog={syncLog}
                    lastSyncResult={lastSyncResult}
                    onComplete={onComplete}
                />
            }
        />
    );
}

function VirtualStatePanel({ documents }: { documents: any[] }) {
    const theme = usePillarTheme();

    const mapTypeToFilename = (type: string) => {
        const map: Record<string, string> = {
            'PRD': 'PRD.md', 'STRATEGY': 'STRATEGY.md', 'SCHEMA': 'SCHEMA.sql',
            'DESIGN': 'DESIGN_SYSTEM.md', 'BACKLOG': 'BACKLOG.md', 'MEMORY': 'MEMORY.md',
            'RELAY_A': 'RELAY_A.md', 'RELAY_B': 'RELAY_B.md', 'RELAY_C': 'RELAY_C.md',
            'RELAY_D': 'RELAY_D.md', 'RELAY_E': 'RELAY_E.md', 'RELAY_F': 'RELAY_F.md'
        };
        return map[type] || type;
    };

    return (
        <PillarPanel>
            <PillarHeader
                icon={Server}
                title="Virtual State (Supabase)"
                actions={<span className="bg-zinc-900 text-zinc-500 text-[10px] px-1.5 rounded">{documents.length} Docs</span>}
            />
            <PillarBody>
                <div className="p-4 space-y-2">
                    {documents.map((doc, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-sm hover:${theme.border} transition-all`}>
                            <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-zinc-600" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-zinc-300">{mapTypeToFilename(doc.type)}</span>
                                    <span className="text-[10px] text-zinc-600 font-mono truncate max-w-[150px]">
                                        {doc.updated_at ? new Date(doc.updated_at).toLocaleString() : 'Unsynced'}
                                    </span>
                                </div>
                            </div>
                            <div className={`h-2 w-2 rounded-full ${theme.bg.replace('/20', '')} animate-pulse`} title="Live in Database" />
                        </div>
                    ))}
                </div>
            </PillarBody>
        </PillarPanel>
    );
}

function IntegrationBridgePanel({ isSyncing, handleSync, lastSyncResult }: { isSyncing: boolean, handleSync: () => void, lastSyncResult: SyncStatus | null }) {
    const theme = usePillarTheme();

    return (
        <PillarPanel>
            <PillarHeader
                icon={RefreshCw}
                title="Integration Bridge"
            />
            <PillarBody>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center p-8 flex-col border-b border-zinc-800 bg-zinc-950/30">
                        <div className={`h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-4 shadow-[0_0_30px_rgba(244,63,94,0.05)]`}>
                            <RefreshCw className={`h-8 w-8 ${theme.text} ${isSyncing ? 'animate-spin' : ''}`} />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-200 uppercase tracking-wide">Integration Bridge</h2>
                        <p className="text-xs text-zinc-500 mt-2 text-center max-w-xs">
                            Synchronize virtual artifacts to the local filesystem. This creates the <span className={`${theme.text} font-mono`}>/docs</span> mirror.
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        {lastSyncResult ? (
                            <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-4 rounded-md">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                                    {lastSyncResult.success ? (
                                        <CheckCircle className={`h-5 w-5 ${theme.text}`} />
                                    ) : (
                                        <Terminal className="h-5 w-5 text-red-500" />
                                    )}
                                    <span className={`text-sm font-bold uppercase ${lastSyncResult.success ? theme.text : 'text-red-400'}`}>
                                        {lastSyncResult.success ? 'Sync Completed' : 'Sync Failed'}
                                    </span>
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
                                    {lastSyncResult.synced?.map((f, i) => (
                                        <div key={i} className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                                            <span className={theme.text}>+</span> {f}
                                        </div>
                                    ))}
                                    {lastSyncResult.error && (
                                        <div className="text-xs font-mono text-red-400">{lastSyncResult.error}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-zinc-700 text-xs italic flex items-center gap-2">
                                <HardDrive className="h-4 w-4" /> Ready to write to disk.
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`w-full py-4 ${theme.bg.replace('/20', '/80')} hover:${theme.bg.replace('/20', '/60')} disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-3 shadow-lg`}
                        >
                            {isSyncing ? "Syncing..." : "Execute Sync to Disk"}
                        </button>
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );
}

function SyncLogPanel({ syncLog, lastSyncResult, onComplete }: { syncLog: string[], lastSyncResult: SyncStatus | null, onComplete?: () => void }) {
    const theme = usePillarTheme();

    return (
        <PillarPanel>
            <PillarHeader
                icon={Terminal}
                title="SYNC_LOG.TXT"
            />
            <PillarBody>
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] leading-relaxed text-zinc-500 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-zinc-800">
                        {syncLog.length > 0 ? (
                            syncLog.join('\n')
                        ) : (
                            <span className="opacity-30">No active session log.</span>
                        )}
                    </div>
                    {lastSyncResult?.success && (
                        <div className="p-3 border-t border-zinc-900 shrink-0">
                            <button
                                onClick={onComplete}
                                className={`w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:${theme.border} text-zinc-500 hover:${theme.text} text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2 transition-all`}
                            >
                                <CheckCircle className="h-3 w-3" /> Complete Phase G
                            </button>
                        </div>
                    )}
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
