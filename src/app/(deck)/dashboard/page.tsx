"use client";

import { MissionStatusBanner } from "@/components/MissionStatusBanner";
import { ProjectVault } from "@/components/ProjectVault";
import { Activity, ShieldCheck, Clock, FileText } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* 1. Mission Status */}
            <section>
                <MissionStatusBanner />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Project Vault (Main Focus) */}
                <section className="lg:col-span-2 flex flex-col gap-4">
                    <h2 className="text-sm font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        Project Vault
                    </h2>
                    <div className="bg-[#0a0a0a] border border-zinc-800/50 rounded-xl min-h-[400px] p-6 relative overflow-hidden">
                        <div className="absolute z-10 top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-50"></div>
                        <ProjectVault />
                    </div>
                </section>

                {/* 3. Side Panel: Activity & Health */}
                <aside className="space-y-8">
                    {/* Health Radar */}
                    <div className="bg-[#0a0a0a] border border-zinc-800/50 rounded-xl p-6 relative group">
                        <div className="absolute z-0 -inset-px bg-gradient-to-b from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-10 rounded-xl transition-opacity pointer-events-none" />
                        <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            Health Radar
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs text-zinc-300">
                                    <span>Architectural Integrity</span>
                                    <span className="font-mono text-emerald-400">98%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                    <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs text-zinc-300">
                                    <span>Strict Layer Separation</span>
                                    <span className="font-mono text-emerald-400">100%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                    <div className="h-full bg-emerald-500 w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs text-zinc-300">
                                    <span>Documentation Sync</span>
                                    <span className="font-mono text-yellow-500 animate-pulse">Pending</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                    <div className="h-full bg-yellow-500/50 w-[60%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-[#0a0a0a] border border-zinc-800/50 rounded-xl p-6">
                        <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                            <Clock className="h-4 w-4 text-emerald-500" />
                            Recent Activity
                        </h3>
                        <div className="relative border-l border-zinc-800 ml-1.5 space-y-6">
                            {[
                                { action: "Work Order Generated", time: "2m ago", user: "AI Architect" },
                                { action: "Schema Snapshot Locked", time: "15m ago", user: "Pilot" },
                                { action: "Design Tokens Extracted", time: "1h ago", user: "Pilot" },
                                { action: "PRD Established", time: "4h ago", user: "Pilot" }
                            ].map((item, i) => (
                                <div key={i} className="pl-6 relative group">
                                    <div className="absolute z-10 -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-900 border border-zinc-700 group-hover:border-emerald-500 group-hover:bg-emerald-950 transition-colors" />
                                    <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">{item.action}</p>
                                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{item.time} • <span className="text-zinc-400">{item.user}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
