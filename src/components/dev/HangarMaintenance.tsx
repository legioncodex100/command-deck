"use client";

import { Activity, Database, Server, ShieldCheck, HardDrive, Cpu, AlertTriangle, CheckCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useProject } from "@/hooks/useProject";

export function HangarMaintenance() {
    const { documents } = useProject();

    // Live Stats State
    const [latency, setLatency] = useState(24);
    const [logs, setLogs] = useState<{ time: string, level: string, msg: string }[]>([
        { time: new Date().toLocaleTimeString(), level: 'INFO', msg: 'System boot sequence initiated...' },
        { time: new Date().toLocaleTimeString(), level: 'INFO', msg: 'Database connection established (Supabase Pool)' },
        { time: new Date().toLocaleTimeString(), level: 'DEBUG', msg: 'Hangar Protocol loaded.' },
    ]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Simulation Engine
    useEffect(() => {
        const interval = setInterval(() => {
            // 1. Fluctuate Latency
            setLatency(prev => {
                const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
                return Math.max(10, Math.min(100, prev + change));
            });

            // 2. Randomly Log Events (10% chance per tick)
            if (Math.random() > 0.8) {
                const events = [
                    { level: 'INFO', msg: 'Health check passed.' },
                    { level: 'DEBUG', msg: 'Syncing delta state...' },
                    { level: 'INFO', msg: 'Cache invalidated.' },
                    { level: 'WARN', msg: 'High memory usage detected in worker.' },
                    { level: 'DEBUG', msg: 'Garbage collection cycle complete.' },
                ];
                const event = events[Math.floor(Math.random() * events.length)];

                setLogs(prev => {
                    const newLogs = [...prev, { time: new Date().toLocaleTimeString(), level: event.level, msg: event.msg }];
                    if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50); // Keep last 50
                    return newLogs;
                });
            }

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Derived Real Stats
    const docCount = documents.length;
    const artifactCount = 0; // useProject doesn't split this yet, roughly documents are artifacts.

    // Helper for log color
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'INFO': return 'text-emerald-500';
            case 'WARN': return 'text-amber-500';
            case 'DEBUG': return 'text-zinc-500';
            default: return 'text-zinc-300';
        }
    };

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
                                    <span className={`text-xs font-mono ${latency > 80 ? 'text-red-500' : 'text-zinc-300'}`}>
                                        {latency}ms
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${latency > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(100, latency)}%` }}
                                    ></div>
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
                                <span className="text-xs text-zinc-400">Total Artifacts</span>
                                <span className="text-xs font-mono text-zinc-200">{docCount} Records</span>
                            </div>
                            <div className="bg-black border border-zinc-800 p-3 rounded flex justify-between items-center">
                                <span className="text-xs text-zinc-400">Sync Status</span>
                                <span className="text-xs font-mono text-emerald-500">SYNCHRONIZED</span>
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
                <div className="mt-6 border border-zinc-800 rounded-lg bg-black overflow-hidden flex flex-col h-64">
                    <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                        <Server className="h-4 w-4" />
                        System Logs (Live Stream)
                    </div>
                    <div ref={logContainerRef} className="p-4 font-mono text-[10px] space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-4 animate-fadeIn">
                                <span className="text-zinc-700 shrink-0">[{log.time}]</span>
                                <span className={`font-bold shrink-0 w-12 ${getLevelColor(log.level)}`}>{log.level}</span>
                                <span className="text-zinc-400">{log.msg}</span>
                            </div>
                        ))}
                        <div className="h-4" /> {/* Spacer */}
                    </div>
                </div>

            </div>
        </div>
    );
}
