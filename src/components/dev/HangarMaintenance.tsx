"use client";

import { Activity, Database, Server, ShieldCheck, HardDrive, Cpu, AlertTriangle, CheckCircle } from "lucide-react";

export function HangarMaintenance() {
    return (
        <div className="h-full w-full bg-[#050505] text-zinc-300 font-mono flex flex-col">
            {/* Header */}
            <div className="h-14 border-b border-zinc-900 bg-black/80 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center border border-zinc-800">
                        <Activity className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100">MAINTENANCE BAY</h1>
                        <p className="text-[10px] text-zinc-500 uppercase">System Diagnostics & Logs</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* System Resources Card */}
                    <div className="bg-zinc-900/20 border border-zinc-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Cpu className="h-5 w-5 text-emerald-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">System Resources</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-zinc-500">Database Connection</span>
                                    <span className="text-emerald-500 font-bold">ACTIVE</span>
                                </div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-zinc-500">API Latency</span>
                                    <span className="text-zinc-300">24ms</span>
                                </div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[10%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Storage Status */}
                    <div className="bg-zinc-900/20 border border-zinc-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <HardDrive className="h-5 w-5 text-emerald-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Vault Storage</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="bg-black border border-zinc-800 p-3 rounded flex justify-between items-center">
                                <span className="text-xs text-zinc-400">Documents</span>
                                <span className="text-xs font-mono text-zinc-200">142 Records</span>
                            </div>
                            <div className="bg-black border border-zinc-800 p-3 rounded flex justify-between items-center">
                                <span className="text-xs text-zinc-400">Artifacts</span>
                                <span className="text-xs font-mono text-zinc-200">28 Files</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Status */}
                    <div className="bg-zinc-900/20 border border-zinc-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Security Protocols</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                <span>RLS Policies Enforced</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                <span>Admin Access Only</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                <span>HTTPS Secured</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Logs Area */}
                <div className="mt-6 border border-zinc-800 rounded-lg bg-black overflow-hidden">
                    <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        System Logs
                    </div>
                    <div className="p-4 font-mono text-[10px] text-zinc-500 space-y-1 h-64 overflow-y-auto">
                        <div className="flex gap-4">
                            <span className="text-zinc-700">[2024-12-29 17:05:01]</span>
                            <span className="text-emerald-500">INFO</span>
                            <span>System boot sequence initiated...</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-zinc-700">[2024-12-29 17:05:02]</span>
                            <span className="text-emerald-500">INFO</span>
                            <span>Database connection established (Supabase Pool)</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-zinc-700">[2024-12-29 17:05:02]</span>
                            <span className="text-emerald-400">DEBUG</span>
                            <span>Hangar Protocol loaded for user: mohammed@legiongrappling.com</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-zinc-700">[2024-12-29 17:05:05]</span>
                            <span className="text-amber-500">WARN</span>
                            <span>Memory Sync check: Local version matches remote. No action taken.</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
